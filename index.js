const { writeFile } = require('fs').promises;
const { writeFileSync } = require('fs');

let prettier;
try {
  // Look for the containing project's prettier
  prettier = require.main.require('prettier');
} catch (err) {}

function preparePrettierConfig(prettierConfig) {
  return {
    // Silence warning about using the default babel parser
    // The parser is still overridable from .prettierrc, as that will come out in the resolved prettier config
    parser: 'babel',
    ...prettierConfig
  };
}

async function prettyMaybe(fileName, code, { requireConfig = true } = {}) {
  if (prettier) {
    const prettierConfig = await prettier.resolveConfig(fileName);
    if (prettierConfig || !requireConfig) {
      code = prettier.format(code, preparePrettierConfig(prettierConfig));
    }
  }
  return writeFile(fileName, code, 'utf-8');
}

prettyMaybe.sync = function prettyMaybe(
  fileName,
  code,
  { requireConfig = true } = {}
) {
  if (prettier) {
    const prettierConfig = prettier.resolveConfig.sync(fileName);
    if (prettierConfig || !requireConfig) {
      code = prettier.format(code, preparePrettierConfig(prettierConfig));
    }
  }
  writeFileSync(fileName, code, 'utf-8');
};

module.exports = prettyMaybe;
