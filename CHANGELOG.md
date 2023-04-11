### Changelog

#### [v0.0.12](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.11...v0.0.12)

> 9 April 2020

- **Breaking change:** BREAKING CHANGE: renamed plugin option speechOutputComponentName to speechOutputComponentNames to allow multiple custom component names [`355b6e7`](https://github.com/flogy/gatsby-mdx-tts/commit/355b6e78d9771524f85400594370b8b32ae868a0)

#### [v0.0.11](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.10...v0.0.11)

> 8 April 2020

- fixed ignoredWordSplittingCharactersRegex interfering with slashes in words [`e032a2b`](https://github.com/flogy/gatsby-mdx-tts/commit/e032a2bb57912d9e5b676de265b55a1f3f536f6e)

#### [v0.0.10](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.9...v0.0.10)

> 8 April 2020

- allow ignoring characters that should not split up word markings [`0f7a3dc`](https://github.com/flogy/gatsby-mdx-tts/commit/0f7a3dce7c53ff5ded2e5383ba792c8bfc42a343)

#### [v0.0.9](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.8...v0.0.9)

> 8 April 2020

- refactored word marking algorithm to allow slashes and diacritics in or between words [`613a216`](https://github.com/flogy/gatsby-mdx-tts/commit/613a216c50368e3cc982f1a7905d5648c5c918ef)

#### [v0.0.8](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.7...v0.0.8)

> 7 April 2020

- allow defining characters to ignore in speech output [`d502ce7`](https://github.com/flogy/gatsby-mdx-tts/commit/d502ce7f856ab0d924358cd0f375ba4a002f96d5)
- lower voice when reading headings even if they do not end with a punctuation mark [`89e8b4a`](https://github.com/flogy/gatsby-mdx-tts/commit/89e8b4aa90ec64a74cbb355cc9ea46148651e52c)

#### [v0.0.7](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.6...v0.0.7)

> 7 April 2020

- **Breaking change:** BREAKING CHANGE: plugin option `lexiconNames` is now called `defaultLexiconNames`, allow adding individual speech output parameters to `&lt;SpeechOutput&gt;` components [`f83497a`](https://github.com/flogy/gatsby-mdx-tts/commit/f83497a8637dcdebf7bac263cf3540d2f366ec2c)
- updated dependencies [`f52148c`](https://github.com/flogy/gatsby-mdx-tts/commit/f52148ca1147b1b581723f5879208b09cdfca69d)

#### [v0.0.6](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.5...v0.0.6)

> 6 April 2020

- Bump acorn from 6.4.0 to 6.4.1 [`#9`](https://github.com/flogy/gatsby-mdx-tts/pull/9)
- added MDX logo to title image [`4eeb2e5`](https://github.com/flogy/gatsby-mdx-tts/commit/4eeb2e52c7ffcdb2ce3360dc235a99d08926349f)
- allow customizing how audio is played by passing in an optional custom sound hook [`d2cee5c`](https://github.com/flogy/gatsby-mdx-tts/commit/d2cee5c326d788be3d7c8e64a58feabe12367094)
- aligned example code styles [`db95261`](https://github.com/flogy/gatsby-mdx-tts/commit/db95261ec183f60e1a3f70c46f84670900c63d46)

#### [v0.0.5](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.4...v0.0.5)

> 1 April 2020

- added fetch polyfill for IE 11 [`ab747cb`](https://github.com/flogy/gatsby-mdx-tts/commit/ab747cb51593eb18a6c05d3c5f79e78699c67e55)

#### [v0.0.4](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.3...v0.0.4)

> 25 March 2020

- fixed prettierignore and reformatted everything [`a1643c7`](https://github.com/flogy/gatsby-mdx-tts/commit/a1643c7b73a87350a5a8842aff6362b5b55acfed)
- fixed marked words getting out of sync with speech output [`b146c9f`](https://github.com/flogy/gatsby-mdx-tts/commit/b146c9fcd900a15587f5c1f89a05737dc8cb83db)
- implemented onWordMarked event listener [`9c0e8cd`](https://github.com/flogy/gatsby-mdx-tts/commit/9c0e8cd326ae12c0c22d8a2e88c1236fe49d20a6)

#### [v0.0.3](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.2...v0.0.3)

> 23 March 2020

- check if HTML resulting from WordMarker contains &lt;marker&gt; tag at correct place in various situations, fixed some issues in the WordMarker to align with expected results [`8b8a899`](https://github.com/flogy/gatsby-mdx-tts/commit/8b8a8994e569bd515dc91818496e204454237c41)
- updated non-major dependencies [`b468304`](https://github.com/flogy/gatsby-mdx-tts/commit/b4683044a714f028489593bedcd9d017e172bcb6)
- cache speech marks and audio file using caching API and print output logs using reporter API of Gatsby [`b5ee573`](https://github.com/flogy/gatsby-mdx-tts/commit/b5ee573d37db2b00a330715d417da66b9085b091)

#### [v0.0.2](https://github.com/flogy/gatsby-mdx-tts/compare/v0.0.1...v0.0.2)

> 26 February 2020

- **Breaking change:** BREAKING CHANGE: the SpeechOutput component needs to be imported from "gatsby-mdx-tts/SpeechOutput" now [`06103cf`](https://github.com/flogy/gatsby-mdx-tts/commit/06103cf010aa129e0df51a187ffe2fefc010e9f6)
- generate MDXAST used for tests from actual MDX files [`c8d047c`](https://github.com/flogy/gatsby-mdx-tts/commit/c8d047c420afeeb9aabbd713b0417132dac3deef)
- automatically generate a changelog file when publishing a new version [`1b211e7`](https://github.com/flogy/gatsby-mdx-tts/commit/1b211e763cfadad7eb26e521b7e9434a8761472d)

#### v0.0.1

> 21 February 2020

- improve and test MDAST to SSML conversion [`eaa52b5`](https://github.com/flogy/gatsby-mdx-tts/commit/eaa52b56b21030c903e33bdca3c49548b88818c3)
- initial work in progress commit [`4f039f5`](https://github.com/flogy/gatsby-mdx-tts/commit/4f039f578ca039a240f526624fb6921b994ef703)
- reformatted using prettier [`45a7d42`](https://github.com/flogy/gatsby-mdx-tts/commit/45a7d42dcad0dc1e23b3dba115678ef9ac513b3d)
