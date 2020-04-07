import { LexiconNameList, VoiceId } from "aws-sdk/clients/polly";
import { Node } from "unist";
import visit from "unist-util-visit";
import getSsmlFromMdxAst from "./getSsmlFromMdxAst";

// @ts-ignore
import findAfter from "unist-util-find-after";

// @ts-ignore
import between from "unist-util-find-all-between";

const acorn = require("acorn");
const jsx = require("acorn-jsx");
const jsxParser = acorn.Parser.extend(jsx());

export interface SpeechOutputBlock {
  id: string;
  text: string;
  lexiconNames?: LexiconNameList;
  ssmlTags?: string;
  voiceId?: VoiceId;
}

const buildSpeechOutputBlock = (
  startNode: Node,
  text: string,
  endNode: Node
): SpeechOutputBlock => {
  const jsxString = `${startNode.value as string}${endNode.value as string}`;
  const jsxAst = jsxParser.parse(jsxString);
  const speechOutputAttributes =
    jsxAst.body[0].expression.openingElement.attributes;

  const idProp = speechOutputAttributes.find(
    (attribute: any) => attribute.name.name === "id"
  );
  const lexiconNamesProp = speechOutputAttributes.find(
    (attribute: any) => attribute.name.name === "lexiconNames"
  );
  const ssmlTagsProp = speechOutputAttributes.find(
    (attribute: any) => attribute.name.name === "ssmlTags"
  );
  const voiceIdProp = speechOutputAttributes.find(
    (attribute: any) => attribute.name.name === "voiceId"
  );

  if (!idProp) {
    throw new Error(
      `Missing SpeechOutput ID prop: ${startNode.value as string}`
    );
  }

  const id = idProp.value.value;
  const lexiconNames =
    lexiconNamesProp &&
    lexiconNamesProp.value.expression.elements.map(
      (element: any) => element.value
    );
  const ssmlTags = ssmlTagsProp && ssmlTagsProp.value.value;
  const voiceId = voiceIdProp && voiceIdProp.value.value;

  return {
    id,
    lexiconNames,
    ssmlTags,
    voiceId,
    text
  } as SpeechOutputBlock;
};

const extractSpeechOutputBlocks = (
  mdxAst: Node,
  speechOutputComponentName: string
): SpeechOutputBlock[] => {
  const speechOutputBlocks: SpeechOutputBlock[] = [];

  const isStartNode = (node: unknown): node is Node => {
    const value = (node as Node).value as string;
    return (
      (node as Node).type === "jsx" &&
      value.startsWith(`<${speechOutputComponentName}`)
    );
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
      speechOutputBlocks.push(
        buildSpeechOutputBlock(startNode, text, relatedEndNode)
      );
    }
  );

  return speechOutputBlocks;
};

export default extractSpeechOutputBlocks;
