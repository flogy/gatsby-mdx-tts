import { Node } from "unist";
import visit from "unist-util-visit";
import path from "path";
import { mkdirSync, readFileSync } from "fs";
import { execSync } from "child_process";
import crypto from "crypto";
import {
  copySync,
  pathExistsSync,
  readJsonSync,
  removeSync,
  writeJsonSync
} from "fs-extra";

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

const generateTtsFiles = (
  speechMarksFilePath: string,
  speechMarksJsonFilePath: string,
  audioFilePath: string,
  text: string
) => {
  removeSync(speechMarksFilePath);
  removeSync(speechMarksJsonFilePath);
  removeSync(audioFilePath);

  mkdirSync(cachePath, { recursive: true });

  const pollyMaleMp3Command = `aws polly synthesize-speech --output-format mp3 --voice-id Hans --text-type ssml --text "<speak><amazon:auto-breaths frequency='medium'><amazon:effect phonation='soft'><prosody rate='70%'>${text}</prosody></amazon:effect></amazon:auto-breaths></speak>" ${audioFilePath}`;
  const pollyMaleSpeechMarksCommand = `aws polly synthesize-speech --output-format json --speech-mark-types=word --voice-id Hans --text-type ssml --text "<speak><amazon:auto-breaths frequency='medium'><amazon:effect phonation='soft'><prosody rate='70%'>${text}</prosody></amazon:effect></amazon:auto-breaths></speak>" ${speechMarksFilePath}`;

  console.log("(Re-)generating file: " + audioFilePath);
  execSync(pollyMaleMp3Command);

  console.log("(Re-)generating file: " + speechMarksFilePath);
  execSync(pollyMaleSpeechMarksCommand);

  console.log("(Re-)generating file: " + speechMarksJsonFilePath);
  generateTtsJson(speechMarksFilePath, speechMarksJsonFilePath, text);
};

interface Parameters {
  markdownAST: Node;
}

interface PluginOptions {}

module.exports = (parameters: Parameters, pluginOptions: PluginOptions) => {
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
      const speechMarksFilePath = path.join(
        cachePath,
        `${speechOutputId}.marks`
      );
      const speechMarksJsonFilePath = path.join(
        cachePath,
        `${speechOutputId}.json`
      );
      const audioFilePath = path.join(cachePath, `${speechOutputId}.mp3`);

      const filesAlreadyExist =
        pathExistsSync(speechMarksFilePath) &&
        pathExistsSync(speechMarksJsonFilePath) &&
        pathExistsSync(audioFilePath);
      if (!filesAlreadyExist || hasTextChanged(speechMarksJsonFilePath, text)) {
        generateTtsFiles(
          speechMarksFilePath,
          speechMarksJsonFilePath,
          audioFilePath,
          text
        );
      }

      mkdirSync(publicPath, { recursive: true });
      copySync(
        speechMarksJsonFilePath,
        path.join(publicPath, `${speechOutputId}.json`)
      );
      copySync(audioFilePath, path.join(publicPath, `${speechOutputId}.mp3`));
    }
  );

  return parameters.markdownAST;
};

export { SpeechOutput } from "./SpeechOutput";

// TODO: make sure if a certain text is no longer existing, related files are deleted as well!
