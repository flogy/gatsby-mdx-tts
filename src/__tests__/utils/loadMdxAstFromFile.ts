// @ts-ignore
import { readSync } from "to-vfile";

// @ts-ignore
import remark from "remark";

// @ts-ignore
import mdx from "remark-mdx";

const testDirectory = "./src/__tests__";

const loadMdxAstFromFile = (fileName: string) => {
  const file = readSync(`${testDirectory}/${fileName}`);
  return remark()
    .use(mdx)
    .parse(file);
};

export default loadMdxAstFromFile;
