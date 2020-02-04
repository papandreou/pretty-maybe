const fs = require('fs').promises;

let prettier;
try {
  prettier = require('prettier');
} catch (err) {}

function maybeApplyPrettier(code, fileName) {
  if (prettier) {
    code = prettier.format(code, {
      // Silence warning about using the default babel parser
      // The parser is still overridable from .prettierrc, as that will come out in the resolved prettier config
      parser: 'babel',
      ...prettier.resolveConfig.sync(fileName)
    });
  }
  return code;
}

function prettyMaybe(fileName, code) {
  return fs.promises.writeFile(fileName, maybeApplyPrettier(fileName, code));
}

module.exports = prettyMaybe;
