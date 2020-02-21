![Logo](./img/gatsby-mdx-tts.svg)

> 🗣 Easy **text-to-speech** for your [Gatsby](https://www.gatsbyjs.org/) site, powered by [Amazon Polly](https://aws.amazon.com/de/polly/).

# gatsby-mdx-tts

![Pull requests are welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen)
![npm](https://img.shields.io/npm/v/gatsby-mdx-tts)
[![GitHub license](https://img.shields.io/github/license/flogy/gatsby-mdx-tts)](https://github.com/flogy/gatsby-mdx-tts/blob/master/LICENSE)

## Installation

`npm install --save gatsby-mdx-tts`

## How to use

### Prerequisites

1. In order to use this plugin you need an [AWS account](https://portal.aws.amazon.com/billing/signup). You can use the text-to-speech service for free for the first 12 months (up to a couple million words to be precise).

   **Attention:** If you exceed the limits or use it after your initial free tier, using this plugin will generate costs in your AWS account!

2. As this is a plugin for [gatsby-plugin-mdx](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-mdx) it will only work if you have that plugin installed and configured properly as well.

### Mandatory configurations

#### gatsby-config.js

To include the plugin just add it to your `gatsby-plugin-mdx` configuration in the `gatsbyRemarkPlugin` section. In case you have multiple `gatsbyRemarkPlugins` configured is very important that you put the `gatsby-mdx-tts` plugin to **first position**!

Also, you need to include a couple of mandatory configurations:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-mdx`,
    options: {
      gatsbyRemarkPlugins: [
        {
          resolve: "gatsby-mdx-tts",
          options: {
            awsRegion: "us-east-1",
            defaultVoiceId: "Justin",
          },
        },
      ],
    },
  },
],
```

#### AWS credentials

The plugin requires your AWS credentials in order to generate the text-to-speech files.

There are two ways to configure your AWS credentials:

1. _(recommended)_ The recommended way is to [create a shared credentials file](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/create-shared-credentials-file.html). You probably already have one if you used the AWS CLI before.
2. To override the credentials defined in a shared credentials file or to easily build on a CI environment you can optionally pass in the AWS credentials using plugin configuration options:

```javascript
// In your gatsby-config.js
{
  "resolve": "gatsby-mdx-tts",
  "options": {
    "awsCredentials": {
      "accessKeyId": process.env.GATSBY_AWS_ACCESS_KEY_ID,
      "secretAccessKey": process.env.GATSBY_AWS_SECRET_ACCESS_KEY,
    },
  },
},
```

**Attention:** If you choose to go with option 2 it is highliy recommended to work with [environment variables](https://www.gatsbyjs.org/docs/environment-variables/) (as seen in the example above)! Do not directly paste your AWS credentials into your `gatsby-config.js` file and commit it to git as this would be a security issue!

### All configurations

| Option            | Required | Example                                                                                                                |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `awsRegion`       | Yes      | `"us-east-1"`                                                                                                          |
| `defaultVoiceId`  | Yes      | `"Justin"`                                                                                                             |
| `awsCredentials`  | No       | `{ "accessKeyId": process.env.GATSBY_AWS_ACCESS_KEY_ID, "secretAccessKey": process.env.GATSBY_AWS_SECRET_ACCESS_KEY }` |
| `defaultSsmlTags` | No       | `"<prosody rate='70%'>$SPEECH_OUTPUT_TEXT</prosody>"`                                                                  |
| `lexiconNames`    | No       | `["LexA", "LexB"]`                                                                                                     |

##### About `defaultSsmlTags`:

- For an overview of all supported SSML tags check out the [supported SSML tags list](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html) in the AWS docs.
- The surrounding `<speak>` tag is added automatically.
- The variable `$SPEECH_OUTPUT_TEXT` will be replaced with the speech output text.

### Embed speech output in your MDX

After configuring the plugin you can just add the `<SpeechOutput/>` component in your MDX files. The surrounded content will then be playable. You can add multiple speech output blocks to your content, but make sure the `id` is always set and **unique over all occurrences**.

```markdown
import SpeechOutput from "gatsby-mdx-tts"

This text will be outside the speech output.

<SpeechOutput id="inside">

But this text will be playable. Please consider that:

- The play button is added automatically.
- The words in this text are marked one by one during text output.

</SpeechOutput>
```

## License

The [MIT License](LICENSE)

## Credits

The _gatsby-mdx-tts_ library is maintained and sponsored by the Swiss web and mobile app development company [Florian Gyger Software](https://floriangyger.ch).
