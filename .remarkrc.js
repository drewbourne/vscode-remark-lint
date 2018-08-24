const fs = require('fs');
const path = require('path');

exports.settings = {};

exports.plugins = [
  require('remark-frontmatter'),
  [
    require('remark-retext'),
    require('unified')().use({
      plugins: [
        require('retext-english'),
        require('retext-syntax-urls'),
        [
          require('retext-spell'),
          {
            ignoreLiteral: true,
            dictionary: require('dictionary-en-us'),
            personal: fs.readFileSync(
              path.join(__dirname, '.dictionary'),
              'utf8'
            ),
          },
        ],
        [require('retext-sentence-spacing'), { preferred: 1 }],
        require('retext-repeated-words'),
        require('retext-usage'),
        require('retext-indefinite-article'),
        require('retext-redundant-acronyms'),
        [
          require('retext-contractions'),
          { straight: true, allowLiteral: true },
        ],
        require('retext-diacritics'),
        [require('retext-quotes'), { preferred: 'straight' }],
      ],
    }),
  ],
];
