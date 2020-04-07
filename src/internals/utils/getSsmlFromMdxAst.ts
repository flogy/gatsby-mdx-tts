import { Node } from "unist";

const headingBreakTag = "<break time='0.5s'/>";
const paragraphBreakTag = "<break time='1s'/>";

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
  if (node.type === "paragraph") {
    ssmlString = `${ssmlString}${paragraphBreakTag}`;
  }
  if (node.type === "heading") {
    ssmlString = `<s>${ssmlString}</s>${headingBreakTag}`;
  }
  return ssmlString;
};

const getSsmlFromMdxAst = (mdAst: Node) => {
  return mdastToSsmlString(mdAst);
};

export default getSsmlFromMdxAst;
