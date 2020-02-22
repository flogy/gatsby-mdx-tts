import extractSpeechOutputBlocks from "../internals/utils/extractSpeechOutputBlocks";
import loadMdxAstFromFile from "./utils/loadMdxAstFromFile";

it("should correctly find one speech output block", () => {
  const mdxAst = loadMdxAstFromFile("single-block.mdx");
  const speechOutputBlocks = extractSpeechOutputBlocks(mdxAst);
  expect(speechOutputBlocks.length).toBe(1);
  const singleSpeechOutputBlock = speechOutputBlocks[0];
  expect(singleSpeechOutputBlock.id).toBe("single-block");
});

it("should correctly find all speech output blocks", () => {
  const mdxAst = loadMdxAstFromFile("three-blocks.mdx");
  const speechOutputBlocks = extractSpeechOutputBlocks(mdxAst);
  expect(speechOutputBlocks.length).toBe(3);
  expect(speechOutputBlocks[0].id).toBe("block-1");
  expect(speechOutputBlocks[1].id).toBe("block-2");
  expect(speechOutputBlocks[2].id).toBe("block-3");
});
