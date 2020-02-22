import loadMdxAstFromFile from "./utils/loadMdxAstFromFile";
import extractSpeechOutputBlocks from "../internals/utils/extractSpeechOutputBlocks";
import getSsmlFromMdxAst from "../internals/utils/getSsmlFromMdxAst";

it("should correctly extract speech output blocks from MDX AST", async () => {
  const mdxAst = loadMdxAstFromFile("single-block.mdx");
  const speechOutputBlock = extractSpeechOutputBlocks(mdxAst)[0];
  expect(speechOutputBlock.text).toEqual(
    "Inside<break time='1s'/>Now, this text is inside the block.<break time='1s'/>And this as well.<break time='1s'/>"
  );
});

it("heading should end with a break SSML tag", () => {
  const headingAst = {
    type: "heading",
    depth: 1,
    children: [
      {
        type: "text",
        value: "Hello, world!",
        position: {
          start: {
            line: 3,
            column: 3,
            offset: 46
          },
          end: {
            line: 3,
            column: 16,
            offset: 59
          },
          indent: []
        }
      }
    ],
    position: {
      start: {
        line: 3,
        column: 1,
        offset: 44
      },
      end: {
        line: 3,
        column: 16,
        offset: 59
      },
      indent: []
    }
  };
  const ssmlString = getSsmlFromMdxAst(headingAst);
  expect(ssmlString).toEqual("Hello, world!<break time='1s'/>");
});