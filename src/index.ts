import {Node} from 'unist';
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
import extractSpeechOutputBlocks, {SpeechOutputBlock} from './utils/extractSpeechOutputBlocks';

const cachePath = "./.cache/tts/";
const publicPath = "./public/tts/";

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

  let ssmlTagsBeforeText = "";
  let ssmlTagsAfterText = "";
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
  speechOutputBlocks: SpeechOutputBlock[],
  pluginOptions: PluginOptions
) => {
  for (let i = 0; i < speechOutputBlocks.length; i++) {
    const speechOutputBlock = speechOutputBlocks[i];

    const speechMarksFilePath = path.join(
      cachePath,
      `${speechOutputBlock.id}.marks`
    );
    const speechMarksJsonFilePath = path.join(
      cachePath,
      `${speechOutputBlock.id}.json`
    );
    const audioFilePath = path.join(
      cachePath,
      `${speechOutputBlock.id}.mp3`
    );

    const filesAlreadyExist =
      pathExistsSync(speechMarksFilePath) &&
      pathExistsSync(speechMarksJsonFilePath) &&
      pathExistsSync(audioFilePath);
    if (
      !filesAlreadyExist ||
      hasTextChanged(speechMarksJsonFilePath, speechOutputBlock.text)
    ) {
      await generateTtsFiles(
        pluginOptions,
        speechMarksFilePath,
        speechMarksJsonFilePath,
        audioFilePath,
        speechOutputBlock.text
      );
    }

    mkdirSync(publicPath, { recursive: true });
    copySync(
      speechMarksJsonFilePath,
      path.join(publicPath, `${speechOutputBlock.id}.json`)
    );
    copySync(
      audioFilePath,
      path.join(publicPath, `${speechOutputBlock.id}.mp3`)
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

module.exports = async (
  parameters: Parameters,
  pluginOptions: PluginOptions
) => {
  const speechOutputBlocks = extractSpeechOutputBlocks(parameters.markdownAST);

  if (speechOutputBlocks.length > 0) {
    await generateFiles(speechOutputBlocks, pluginOptions);
  }

  return parameters.markdownAST;
};

// TODO: make sure if a certain text is no longer existing, related files are deleted as well!
