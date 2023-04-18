---
"gatsby-mdx-tts": major
---

- Add file ending to `SpeechOutput` component imports in your MDX files: `import SpeechOutput from "gatsby-mdx-tts/SpeechOutput.js";` as MDX v2 only supports ESM imports.
- Plugin option `awsCredentials` was removed. Use `awsProfile` or environment variables instead (see README for details).
- Refresh Gatsby cache using `npx gatsby clean` as the cache mechanics have changed.
