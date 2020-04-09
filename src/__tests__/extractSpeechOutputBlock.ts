import { LexiconNameList } from "aws-sdk/clients/polly";
import extractSpeechOutputBlocks from "../internals/utils/extractSpeechOutputBlocks";
import loadMdxAstFromFile from "./utils/loadMdxAstFromFile";

it("should correctly find one speech output block", () => {
  const mdxAst = loadMdxAstFromFile("single-block.mdx");
  const speechOutputBlocks = extractSpeechOutputBlocks(mdxAst, [
    "SpeechOutput"
  ]);
  expect(speechOutputBlocks.length).toBe(1);
  const singleSpeechOutputBlock = speechOutputBlocks[0];
  expect(singleSpeechOutputBlock.id).toBe("single-block");
});

it("should correctly find all speech output blocks", () => {
  const mdxAst = loadMdxAstFromFile("three-blocks.mdx");
  const speechOutputBlocks = extractSpeechOutputBlocks(mdxAst, [
    "SpeechOutput"
  ]);
  expect(speechOutputBlocks.length).toBe(3);
  expect(speechOutputBlocks[0].id).toBe("block-1");
  expect(speechOutputBlocks[1].id).toBe("block-2");
  expect(speechOutputBlocks[2].id).toBe("block-3");
});

it("should correctly find one speech output block with custom component containing multiple props in random order", () => {
  const mdxAst = loadMdxAstFromFile("single-block-custom-name.mdx");
  const speechOutputBlocks = extractSpeechOutputBlocks(mdxAst, ["CustomName"]);
  expect(speechOutputBlocks.length).toBe(1);
  const singleSpeechOutputBlock = speechOutputBlocks[0];
  expect(singleSpeechOutputBlock.id).toBe("single-block");
});

it("should correctly find all speech output blocks with multiple custom component names", () => {
  const mdxAst = loadMdxAstFromFile("three-blocks-custom-names.mdx");
  const speechOutputBlocks = extractSpeechOutputBlocks(mdxAst, [
    "CustomNameOne",
    "CustomNameTwo",
    "CustomNameThree"
  ]);
  expect(speechOutputBlocks.length).toBe(3);

  expect(speechOutputBlocks[0].id).toBe("block-1");
  expect(speechOutputBlocks[1].id).toBe("block-2");
  expect(speechOutputBlocks[2].id).toBe("block-3");
});

it("should correctly extract custom props from speech output blocks", () => {
  const mdxAst = loadMdxAstFromFile("three-blocks-custom-props.mdx");
  const speechOutputBlocks = extractSpeechOutputBlocks(mdxAst, [
    "SpeechOutput"
  ]);
  expect(speechOutputBlocks.length).toBe(3);

  expect(speechOutputBlocks[0].id).toBe("block-1");
  expect(speechOutputBlocks[0].lexiconNames).toBeUndefined();
  expect(speechOutputBlocks[0].ssmlTags).toBeUndefined();
  expect(speechOutputBlocks[0].voiceId).toBe("Marlene");

  expect(speechOutputBlocks[1].id).toBe("block-2");
  expect(speechOutputBlocks[1].lexiconNames).toBeUndefined();
  expect(speechOutputBlocks[1].ssmlTags).toBe(
    "<prosody rate='70%'>$SPEECH_OUTPUT_TEXT</prosody>"
  );
  expect(speechOutputBlocks[1].voiceId).toBeUndefined();

  const expectedLexiconNames: LexiconNameList = ["LexA", "LexB"];
  expect(speechOutputBlocks[2].id).toBe("block-3");
  expect(speechOutputBlocks[2].lexiconNames).toEqual(expectedLexiconNames);
  expect(speechOutputBlocks[2].ssmlTags).toBe(
    "<prosody rate='70%'>$SPEECH_OUTPUT_TEXT</prosody>"
  );
  expect(speechOutputBlocks[2].voiceId).toBe("Hans");
});
