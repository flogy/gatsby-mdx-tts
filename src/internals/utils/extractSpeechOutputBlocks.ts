import { Node } from "unist";
import visit from "unist-util-visit";
import getSsmlFromMdxAst from "./getSsmlFromMdxAst";

// @ts-ignore
import findAfter from "unist-util-find-after";

// @ts-ignore
import between from "unist-util-find-all-between";

export interface SpeechOutputBlock {
  id: string;
  text: string;
}

const extractSpeechOutputId = (startNode: Node, speechOutputComponentName: string) => {
  const value = startNode.value as string;
  const regex = new RegExp(`<${speechOutputComponentName}.*id="([^"]*)".*>`);
  const matches = value.match(regex);
  if (matches) {
    return matches[1];
  } else {
    throw new Error("Missing/invalid SpeechOutput ID prop found.");
  }
};

const extractSpeechOutputBlocks = (mdxAst: Node, speechOutputComponentName: string): SpeechOutputBlock[] => {
  const speechOutputBlocks: SpeechOutputBlock[] = [];

  const isStartNode = (node: unknown): node is Node => {
      const value = (node as Node).value as string;
      return (node as Node).type === "jsx" && value.startsWith(`<${speechOutputComponentName}`);
  };

    const isEndNode = (node: Node) => {
        const value = node.value as string;
        return node.type === "jsx" && value === `</${speechOutputComponentName}>`;
    };

  visit<Node>(
    mdxAst,
      isStartNode,
    (startNode: Node, startNodeIndex: number, parent: Node) => {
      const relatedEndNode = findAfter(parent, startNode, isEndNode);
      const nodesToGetTextFrom = between(parent, startNode, relatedEndNode);
      const text = nodesToGetTextFrom.map(getSsmlFromMdxAst).join("");

      const speechOutputId = extractSpeechOutputId(startNode, speechOutputComponentName);
      // TODO: also get voice parameter props and use them for generation (and check if they changed?)

      speechOutputBlocks.push({
        id: speechOutputId,
        text
      });
    }
  );

  return speechOutputBlocks;
};

export default extractSpeechOutputBlocks;
