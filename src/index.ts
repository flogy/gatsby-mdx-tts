import { Node } from "unist";
import path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { createInterface } from "readline";
import crypto from "crypto";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import {
  PollyClient,
  SynthesizeSpeechCommand,
  SynthesizeSpeechCommandInput,
  VoiceId,
} from "@aws-sdk/client-polly";
import { GatsbyCache, Reporter } from "gatsby";
import extractSpeechOutputBlocks, {
  SpeechOutputBlock,
} from "./internals/utils/extractSpeechOutputBlocks";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getSpeechMarksCacheKey = (speechOutputId: string) =>
  `${speechOutputId}.json`;
const getAudioCacheKey = (speechOutputId: string) => `${speechOutputId}.mp3`;

const publicPath = "./public/tts/";

const getHash = (text: string) =>
  crypto.createHash("md5").update(text).digest("hex");

const hasTextChanged = (speechMarksJson: any, freshText: string) => {
  const textHashInFile = speechMarksJson.textHash;
  return getHash(freshText) !== textHashInFile;
};

const generateTtsFiles = async (
  pluginOptions: PluginOptions,
  speechOutputBlock: SpeechOutputBlock,
  cache: GatsbyCache,
  reporter: Reporter
) => {
  // TODO: move AWS and Polly initialization out of this loop but only initialize if actually some text has changed
  const client = new PollyClient({
    apiVersion: "2016-06-10",
    region: pluginOptions.awsRegion,
    credentials: defaultProvider({
      profile: pluginOptions.awsProfile,
      mfaCodeProvider: async (mfaSerial) => {
        return new Promise((resolve) => {
          readline.question(
            `Enter MFA token for AWS account: ${mfaSerial}\n`,
            (mfaToken) => {
              readline.close();
              resolve(mfaToken);
            }
          );
        });
      },
    }),
  });

  let ssmlTagsBeforeText = "";
  let ssmlTagsAfterText = "";
  const ssmlTagsToUse =
    speechOutputBlock.ssmlTags || pluginOptions.defaultSsmlTags;
  if (ssmlTagsToUse) {
    if (ssmlTagsToUse.indexOf("$SPEECH_OUTPUT_TEXT") === -1) {
      throw new Error(
        "If the 'defaultSsmlTags' option is defined it must contain the '$SPEECH_OUTPUT_TEXT' variable (see README file)."
      );
    }
    const matches = ssmlTagsToUse.match(/(.*)\$SPEECH_OUTPUT_TEXT(.*)/);
    if (!!matches) {
      ssmlTagsBeforeText = matches[1];
      ssmlTagsAfterText = matches[2];
    } else {
      throw new Error(
        "Invalid 'defaultSsmlTags' option defined. Check README file for more information about the option."
      );
    }
  }
  const textWithSsmlTags = `<speak>${ssmlTagsBeforeText}${speechOutputBlock.text}${ssmlTagsAfterText}</speak>`;

  const pollyBaseConfiguration: Omit<
    SynthesizeSpeechCommandInput,
    "OutputFormat"
  > = {
    VoiceId: speechOutputBlock.voiceId || pluginOptions.defaultVoiceId,
    LexiconNames:
      speechOutputBlock.lexiconNames || pluginOptions.defaultLexiconNames,
    TextType: "ssml",
    Text: textWithSsmlTags,
  };

  reporter.info(
    `(Re-)generating mp3 for SpeechOutput with ID: ${speechOutputBlock.id}`
  );
  const mp3Data = await client.send(
    new SynthesizeSpeechCommand({
      OutputFormat: "mp3",
      ...pollyBaseConfiguration,
    })
  );
  const audio = await mp3Data.AudioStream?.transformToByteArray();
  if (audio) {
    cache.set(
      getAudioCacheKey(speechOutputBlock.id),
      Buffer.from(audio).toString("base64")
    );
  }

  reporter.info(
    `(Re-)generating speech marks for SpeechOutput with ID: ${speechOutputBlock.id}`
  );
  const jsonData = await client.send(
    new SynthesizeSpeechCommand({
      OutputFormat: "json",
      SpeechMarkTypes: ["word"],
      ...pollyBaseConfiguration,
    })
  );
  const speechMarks = await jsonData.AudioStream?.transformToString();
  if (speechMarks) {
    const speechMarksJson = JSON.parse(
      `[${speechMarks.replace(/\}\n\{/g, "},{")}]`
    );
    // TODO: also check if SpeechOutput props have changed!
    const json = {
      textHash: getHash(speechOutputBlock.text),
      speechMarks: speechMarksJson,
    };
    cache.set(getSpeechMarksCacheKey(speechOutputBlock.id), json);
  }
};

const generateFiles = async (
  speechOutputBlocks: SpeechOutputBlock[],
  pluginOptions: PluginOptions,
  cache: GatsbyCache,
  reporter: Reporter
) => {
  for (let i = 0; i < speechOutputBlocks.length; i++) {
    const speechOutputBlock = speechOutputBlocks[i];

    const speechMarks = await cache.get(
      getSpeechMarksCacheKey(speechOutputBlock.id)
    );
    const audio = await cache.get(getAudioCacheKey(speechOutputBlock.id));

    const filesAlreadyExist = speechMarks && audio;

    // TODO: also check if SpeechOutput props have changed!
    const isGenerationRequired =
      !filesAlreadyExist || hasTextChanged(speechMarks, speechOutputBlock.text);

    if (
      pluginOptions.skipRegeneratingIfExistingInPublicFolder &&
      existsSync(path.join(publicPath, `${speechOutputBlock.id}.mp3`)) &&
      existsSync(path.join(publicPath, `${speechOutputBlock.id}.json`))
    ) {
      reporter.info(
        `Skip regenerating because of 'skipRegeneratingIfExistingInPublicFolder' flag for SpeechOutput with ID: ${speechOutputBlock.id}`
      );
      return;
    }

    if (isGenerationRequired) {
      await generateTtsFiles(pluginOptions, speechOutputBlock, cache, reporter);
    } else {
      reporter.info(
        `Skip regenerating unchanged SpeechOutput with ID: ${speechOutputBlock.id}`
      );
    }

    const eventuallyRegeneratedSpeechMarks = await cache.get(
      getSpeechMarksCacheKey(speechOutputBlock.id)
    );

    const eventuallyRegeneratedAudio = await cache.get(
      getAudioCacheKey(speechOutputBlock.id)
    );

    mkdirSync(publicPath, { recursive: true });

    if (eventuallyRegeneratedAudio) {
      writeFileSync(
        path.join(publicPath, `${speechOutputBlock.id}.mp3`),
        Buffer.from(eventuallyRegeneratedAudio, "base64")
      );
    } else {
      reporter.warn(
        `No audio data found in cache for SpeechOutput with ID: ${speechOutputBlock.id}`
      );
    }

    if (eventuallyRegeneratedSpeechMarks) {
      writeFileSync(
        path.join(publicPath, `${speechOutputBlock.id}.json`),
        JSON.stringify(eventuallyRegeneratedSpeechMarks)
      );
    } else {
      reporter.warn(
        `No speech marks found in cache for SpeechOutput with ID: ${speechOutputBlock.id}`
      );
    }
  }
};

interface Parameters {
  markdownAST: Node;
  cache: GatsbyCache;
  reporter: Reporter;
}

interface PluginOptions {
  awsRegion: string;
  defaultVoiceId: VoiceId;
  awsProfile?: string;
  defaultSsmlTags?: string;
  defaultLexiconNames?: Array<string>;
  ignoredCharactersRegex?: RegExp;
  speechOutputComponentNames?: string[];
  skipRegeneratingIfExistingInPublicFolder?: boolean;
}

module.exports = async (
  parameters: Parameters,
  pluginOptions: PluginOptions
) => {
  const speechOutputBlocks = extractSpeechOutputBlocks(
    parameters.markdownAST,
    pluginOptions.speechOutputComponentNames || ["SpeechOutput"],
    pluginOptions.ignoredCharactersRegex
  );

  if (speechOutputBlocks.length > 0) {
    await generateFiles(
      speechOutputBlocks,
      pluginOptions,
      parameters.cache,
      parameters.reporter
    );
  }

  return parameters.markdownAST;
};

// TODO: make sure if a certain text is no longer existing, related files are deleted as well!
