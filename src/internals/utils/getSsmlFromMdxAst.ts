import { Node } from "unist";
import visit from "unist-util-visit";

const headingBreakTag = "<break time='0.5s'/>";
const paragraphBreakTag = "<break time='1s'/>";

const getChildText = (node: Node) => {
  const textParts: string[] = [];

  visit<Node>(
    node,
    [
      (node: Node) => {
        return node.type === "text";
      },
    ],
    (node) => {
      textParts.push(node.value as string);
    }
  );

  return textParts.join("");
};

const mdastToSsmlString = (node: Node) => {
  const textParts: string[] = [];

  visit<Node>(
    node,
    [
      (node: Node) => {
        return ["paragraph", "heading"].includes(node.type);
      },
    ],
    (node) => {
      if (node.type === "paragraph") {
        textParts.push(`${getChildText(node)}${paragraphBreakTag}`);
      } else if (node.type === "heading") {
        textParts.push(`<s>${getChildText(node)}</s>${headingBreakTag}`);
      }
    }
  );

  return textParts.join("");
};

const getSsmlFromMdxAst = (mdAst: Node) => {
  return mdastToSsmlString(mdAst);
};

export default getSsmlFromMdxAst;
