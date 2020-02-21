import { Node } from "unist";

const defaultBreakTag = "<break time='1s'/>";

const mdastToSsmlString = (node: Node) => {
  let ssmlString = "";
  if (node.type !== "jsx") {
    ssmlString = ssmlString.concat(
      ((node && node.value && node.value) as string) || ""
    );
  }
  const children: any = node.children;
  if (children) {
    ssmlString = ssmlString.concat(children.map(mdastToSsmlString).join(""));
  }
  if (node.type === "paragraph" || node.type === "heading") {
    ssmlString = ssmlString.concat(defaultBreakTag);
  }
  return ssmlString;
};

const getSsmlFromMdAst = (mdAst: Node) => {
  return mdastToSsmlString(mdAst);
};

export default getSsmlFromMdAst;
