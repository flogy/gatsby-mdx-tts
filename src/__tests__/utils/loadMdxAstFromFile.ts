import { readSync } from "to-vfile";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";

const testDirectory = "./src/__tests__";

const loadMdxAstFromFile = (fileName: string) => {
  const file = readSync(`${testDirectory}/${fileName}`);
  return unified()
    .use(remarkParse)
    .use(remarkMdx)
    .parse(file);
};

export default loadMdxAstFromFile;
