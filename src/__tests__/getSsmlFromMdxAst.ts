import loadMdxAstFromFile from "./utils/loadMdxAstFromFile";
import extractSpeechOutputBlocks from "../internals/utils/extractSpeechOutputBlocks";
import getSsmlFromMdxAst from "../internals/utils/getSsmlFromMdxAst";

it("should correctly extract speech output blocks from MDX AST", async () => {
  const mdxAst = loadMdxAstFromFile("single-block.mdx");
  const speechOutputBlock = extractSpeechOutputBlocks(mdxAst, [
    "SpeechOutput"
  ])[0];
  expect(speechOutputBlock.text).toEqual(
    "<s>Inside</s><break time='0.5s'/>Now, this text is inside the block.<break time='1s'/><s>Second title</s><break time='0.5s'/>And this as well.<break time='1s'/>"
  );
});

it("should remove ignored special characters", async () => {
  const mdxAst = loadMdxAstFromFile("single-block-with-special-characters.mdx");
  const speechOutputBlock = extractSpeechOutputBlocks(
    mdxAst,
    ["SpeechOutput"],
    /·/
  )[0];
  expect(speechOutputBlock.text).toEqual(
    "<s>Inside</s><break time='0.5s'/>I am a bit fearful that this dot is vocalized. The dot in the word fearful should be filtered out.<break time='1s'/>"
  );
});

it("heading should be enclosed in a <s> and end with a <break> SSML tag", () => {
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
  expect(ssmlString).toEqual("<s>Hello, world!</s><break time='0.5s'/>");
});
