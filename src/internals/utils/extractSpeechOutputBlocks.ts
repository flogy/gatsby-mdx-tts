import { VoiceId } from "@aws-sdk/client-polly";
import { Node } from "unist";
import visit from "unist-util-visit";
import getSsmlFromMdxAst from "./getSsmlFromMdxAst";

export interface SpeechOutputBlock {
  id: string;
  text: string;
  lexiconNames?: string[];
  ssmlTags?: string;
  voiceId?: VoiceId;
}

const buildSpeechOutputBlock = (node: Node): SpeechOutputBlock => {
  // @ts-ignore
  const speechOutputAttributes = node.attributes.filter(
    (attribute: any) => attribute.type === "mdxJsxAttribute"
  );
  const id = speechOutputAttributes.find(
    (attribute: any) => attribute.name === "id"
  )?.value;
  const lexiconNamesBody = speechOutputAttributes.find(
    (attribute: any) => attribute.name === "lexiconNames"
  )?.value?.data?.estree?.body;
  const lexiconNames =
    lexiconNamesBody?.length &&
    lexiconNamesBody[0]?.expression?.elements?.map(
      (element: any) => element.value
    );
  const ssmlTags = speechOutputAttributes.find(
    (attribute: any) => attribute.name === "ssmlTags"
  )?.value;
  const voiceId = speechOutputAttributes.find(
    (attribute: any) => attribute.name === "voiceId"
  )?.value;

  if (!id) {
    throw new Error(`Missing SpeechOutput ID prop: ${node.value as string}`);
  }

  const returnValue: SpeechOutputBlock = {
    id,
    lexiconNames,
    ssmlTags,
    voiceId,
    text: getSsmlFromMdxAst(node),
  };

  return returnValue;
};

const extractSpeechOutputBlocks = (
  mdxAst: Node,
  speechOutputComponentNames: string[],
  ignoredCharactersRegex?: RegExp
): SpeechOutputBlock[] => {
  const speechOutputBlocks: SpeechOutputBlock[] = [];

  visit<Node>(
    mdxAst,
    [
      (node: Node) => {
        return (
          node.type === "mdxJsxFlowElement" &&
          speechOutputComponentNames.includes(node.name as string)
        );
      },
    ],
    (node) => {
      speechOutputBlocks.push(buildSpeechOutputBlock(node));
    }
  );

  if (ignoredCharactersRegex) {
    speechOutputBlocks.forEach(
      (block) =>
        (block.text = block.text.replace(
          new RegExp(ignoredCharactersRegex, "g"),
          ""
        ))
    );
  }

  return speechOutputBlocks;
};

export default extractSpeechOutputBlocks;
