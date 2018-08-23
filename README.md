# vscode-remark-lint README

## Features

Use [Unified](https://unifiedjs.github.io/), [Remark](https://remark.js.org/), and [Retext](https://github.com/retextjs/retext) plugins to lint Markdown.

Plugins are available to:

- Check spelling
- Check readability
- Avoid repeated words
- Avoid profanity
- Avoid passive words / phrases

## Recommendations

Use [Prettier](https://prettier.io/) and the [Prettier VS Code extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for format Markdown.

## Requirements

This extension requires packages to be installed locally, and a `.remarkrc.js` (or similar) configuration file in same folder hierarchy as the `.md` Markdown files that will be linted.

## Example configuration

Install packages:

```sh
npm install --save unified remark-frontmatter remark-retext retext-english retext-syntax-urls retext-spell dictionary-en-us retext-sentence-spacing retext-repeated-words retext-usage remark-preset-lint-consistent remark-preset-lint-recommended remark-preset-lint-markdown-style-guide
```

Create an `.remarkrc.js` with settings and plugins:

```js
// .remarkrc.js
exports.plugins = [
  require('remark-frontmatter'),
  [
    require('remark-retext'),
    require('unified')().use({
      plugins: [
        require('retext-english'),
        require('retext-syntax-urls'),
        [require('retext-spell'), require('dictionary-en-us')],
        [require('retext-sentence-spacing'), { preferred: 1 }],
        require('retext-repeated-words'),
        require('retext-usage'),
      ],
    }),
  ],
  require('remark-preset-lint-consistent'),
  require('remark-preset-lint-recommended'),
  require('remark-preset-lint-markdown-style-guide'),
];
```

<!--
## Extension Settings

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.
-->

## Release Notes

### 1.0.0

- First Release

---

## Links

- [GitHub](https://github.com/drewbourne/vscode-remark-lint)

---

## LICENSE

MIT
