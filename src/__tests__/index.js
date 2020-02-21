const testAst = require("./testAst");

// TODO: this used the build output as we need a JS file -> should use the source TS file though!
const extractSpeechOutputBlocks = require("../../utils/extractSpeechOutputBlocks");
const getSsmlFromMdAst = require("../../utils/getSsmlFromMdAst");

it("should correctly extract speech output blocks from MDX AST", async () => {
  const speechOutputBlocks = extractSpeechOutputBlocks.default(testAst);
  expect(speechOutputBlocks.length).toEqual(1);
  expect(speechOutputBlocks[0].id).toEqual("mdxText");
  expect(speechOutputBlocks[0].text).toEqual(
    "This is a test heading<break time='1s'/>And this is a test text. And one more sentence. We now include a link to the Google website.<break time='1s'/>Hope it all works. And if not:<break time='1s'/>We can do something about it.<break time='1s'/>Or we just ignore it.<break time='1s'/>"
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
  const ssmlString = getSsmlFromMdAst.default(headingAst);
  expect(ssmlString).toEqual("Hello, world!<break time='1s'/>");
});
