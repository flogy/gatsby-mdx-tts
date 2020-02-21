import { Node } from "unist";
import visit from "unist-util-visit";
import getSsmlFromMdAst from "./getSsmlFromMdAst";

// @ts-ignore
import findAfter from "unist-util-find-after";

// @ts-ignore
import between from "unist-util-find-all-between";

export interface SpeechOutputBlock {
  id: string;
  text: string;
}

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

const extractSpeechOutputBlocks = (mdxAst: Node): SpeechOutputBlock[] => {
  const speechOutputBlocks: SpeechOutputBlock[] = [];

  visit<Node>(
    mdxAst,
    isStartNode,
    (startNode: Node, startNodeIndex: number, parent: Node) => {
      const relatedEndNode = findAfter(parent, startNode, isEndNode);
      const nodesToGetTextFrom = between(parent, startNode, relatedEndNode);
      const text = nodesToGetTextFrom.map(getSsmlFromMdAst).join("");

      const speechOutputId = extractSpeechOutputId(startNode);
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
