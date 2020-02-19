import { Node } from "unist";
import visit from "unist-util-visit";
import path from "path";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import crypto from "crypto";
import {
  copySync,
  pathExistsSync,
  readJsonSync,
  removeSync,
  writeJsonSync
} from "fs-extra";
import AWS from "aws-sdk";
import { LexiconNameList, VoiceId } from "aws-sdk/clients/polly";
const AwsConfig = AWS.config;
import { AWSRegion } from "aws-sdk/clients/cur";

// @ts-ignore
import findAfter from "unist-util-find-after";

// @ts-ignore
import between from "unist-util-find-all-between";

const cachePath = "./.cache/tts/";
const publicPath = "./public/tts/";

const isStartNode = (node: unknown): node is Node => {
  const value = (node as Node).value as string;
  return (node as Node).type === "jsx" && value.startsWith("<SpeechOutput");
};

const isEndNode = (node: Node) => {
  const value = node.value as string;
  return node.type === "jsx" && value === "</SpeechOutput>";
};

const extractSpeechOutputId = (startNode: Node) => {
  const value = startNode.value as string;
  const regex = /<SpeechOutput id="(.*)">/;
  const matches = value.match(regex);
  if (matches) {
    return matches[1];
  } else {
    throw new Error("Missing/invalid SpeechOutput ID prop found.");
  }
};

const extractTextPartsFromNode = (node: Node) => {
  const isTextNode = node.type === "text";
  if (isTextNode) {
    return node.value;
  }

  const hasChildrenDefinition = !!node.children;
  if (!hasChildrenDefinition) {
    return undefined;
  }

  const children: any = node.children;
  return children.map(extractTextPartsFromNode);
};

const hasTextChanged = (speechMarksJsonFilePath: string, freshText: string) => {
  const freshTextHash = crypto
    .createHash("md5")
    .update(freshText)
    .digest("hex");
  const textHashInFile = readJsonSync(speechMarksJsonFilePath).textHash;
  return freshTextHash !== textHashInFile;
};

const generateTtsJson = (
  speechMarksFilePath: string,
  speechMarksJsonFilePath: string,
  text: string
) => {
  const speechMarksFileContent = readFileSync(speechMarksFilePath, "utf-8");
  const speechMarksJson = JSON.parse(
    `[${speechMarksFileContent.replace(/\}\n\{/g, "},{")}]`
  );
  const json = {
    textHash: crypto
      .createHash("md5")
      .update(text)
      .digest("hex"),
    speechMarks: speechMarksJson
  };
  writeJsonSync(speechMarksJsonFilePath, json);
};

const generateTtsFiles = async (
  pluginOptions: PluginOptions,
  speechMarksFilePath: string,
  speechMarksJsonFilePath: string,
  audioFilePath: string,
  text: string
) => {
  // TODO: move AWS and Polly initialization out of this loop but only initialize if actually some text has changed
  AwsConfig.update({
    region: pluginOptions.awsRegion,
    ...(pluginOptions.awsCredentials && {
      credentials: {
        accessKeyId: pluginOptions.awsCredentials.accessKeyId,
        secretAccessKey: pluginOptions.awsCredentials.secretAccessKey
      }
    })
  });
  const Polly = new AWS.Polly({ apiVersion: "2016-06-10" });

  removeSync(speechMarksFilePath);
  removeSync(speechMarksJsonFilePath);
  removeSync(audioFilePath);

  mkdirSync(cachePath, { recursive: true });

  let ssmlTagsBeforeText = "",
    ssmlTagsAfterText = "";
  if (pluginOptions.defaultSsmlTags) {
    if (pluginOptions.defaultSsmlTags.indexOf("$SPEECH_OUTPUT_TEXT") === -1) {
      throw new Error(
        "If the 'defaultSsmlTags' option is defined it must contain the '$SPEECH_OUTPUT_TEXT' variable (see README file)."
      );
    }
    const matches = pluginOptions.defaultSsmlTags.match(
      /(.*)\$SPEECH_OUTPUT_TEXT(.*)/
    );
    if (!!matches) {
      ssmlTagsBeforeText = matches[1];
      ssmlTagsAfterText = matches[2];
    } else {
      throw new Error(
        "Invalid 'defaultSsmlTags' option defined. Check README file for more information about the option."
      );
    }
  }
  const textWithSsmlTags = `<speak>${ssmlTagsBeforeText}${text}${ssmlTagsAfterText}</speak>`;

  const pollyBaseConfiguration = {
    VoiceId: pluginOptions.defaultVoiceId,
    LexiconNames: pluginOptions.lexiconNames,
    TextType: "ssml",
    Text: textWithSsmlTags
  };

  console.log("(Re-)generating file: " + audioFilePath);
  const mp3Data = await Polly.synthesizeSpeech({
    OutputFormat: "mp3",
    ...pollyBaseConfiguration
  }).promise();
  if (mp3Data.AudioStream instanceof Buffer) {
    writeFileSync(audioFilePath, mp3Data.AudioStream);
  }

  console.log("(Re-)generating file: " + speechMarksFilePath);
  const jsonData = await Polly.synthesizeSpeech({
    OutputFormat: "json",
    SpeechMarkTypes: ["word"],
    ...pollyBaseConfiguration
  }).promise();
  if (jsonData.AudioStream instanceof Buffer) {
    writeFileSync(speechMarksFilePath, jsonData.AudioStream);
  }

  console.log("(Re-)generating file: " + speechMarksJsonFilePath);
  generateTtsJson(speechMarksFilePath, speechMarksJsonFilePath, text);
};

const generateFiles = async (
  filesToGenerate: FileToGenerate[],
  pluginOptions: PluginOptions
) => {
  for (let i = 0; i < filesToGenerate.length; i++) {
    const fileToGenerate = filesToGenerate[i];

    const speechMarksFilePath = path.join(
      cachePath,
      `${fileToGenerate.speechOutputId}.marks`
    );
    const speechMarksJsonFilePath = path.join(
      cachePath,
      `${fileToGenerate.speechOutputId}.json`
    );
    const audioFilePath = path.join(
      cachePath,
      `${fileToGenerate.speechOutputId}.mp3`
    );

    const filesAlreadyExist =
      pathExistsSync(speechMarksFilePath) &&
      pathExistsSync(speechMarksJsonFilePath) &&
      pathExistsSync(audioFilePath);
    if (
      !filesAlreadyExist ||
      hasTextChanged(speechMarksJsonFilePath, fileToGenerate.text)
    ) {
      await generateTtsFiles(
        pluginOptions,
        speechMarksFilePath,
        speechMarksJsonFilePath,
        audioFilePath,
        fileToGenerate.text
      );
    }

    mkdirSync(publicPath, { recursive: true });
    copySync(
      speechMarksJsonFilePath,
      path.join(publicPath, `${fileToGenerate.speechOutputId}.json`)
    );
    copySync(
      audioFilePath,
      path.join(publicPath, `${fileToGenerate.speechOutputId}.mp3`)
    );
  }
};

interface Parameters {
  markdownAST: Node;
}

interface PluginOptions {
  awsRegion: AWSRegion;
  defaultVoiceId: VoiceId;
  awsCredentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  defaultSsmlTags?: string;
  lexiconNames?: LexiconNameList;
}

interface FileToGenerate {
  speechOutputId: string;
  text: string;
}

module.exports = async (
  parameters: Parameters,
  pluginOptions: PluginOptions
) => {
  const filesToGenerate: FileToGenerate[] = [];

  visit<Node>(
    parameters.markdownAST,
    isStartNode,
    (startNode: Node, startNodeIndex: number, parent: Node) => {
      const relatedEndNode = findAfter(parent, startNode, isEndNode);
      const nodesToGetTextFrom = between(parent, startNode, relatedEndNode);
      const text = nodesToGetTextFrom
        .map(extractTextPartsFromNode)
        .join(" ")
        .replace(/\n/g, " ");

      const speechOutputId = extractSpeechOutputId(startNode);
      // TODO: also get voice parameter props and use them for generation (and check if they changed?)

      filesToGenerate.push({
        speechOutputId,
        text
      });
    }
  );

  if (filesToGenerate.length > 0) {
    await generateFiles(filesToGenerate, pluginOptions);
  }

  return parameters.markdownAST;
};

export { SpeechOutput } from "./SpeechOutput";

// TODO: make sure if a certain text is no longer existing, related files are deleted as well!
