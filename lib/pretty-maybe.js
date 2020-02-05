const findFileUp = require('find-file-up');
const memoizeSync = require('memoizesync');
const memoizedFindFileUp = memoizeSync(findFileUp.promise);
const memoizedFindFileUpSync = memoizeSync(findFileUp.sync);
const pathModule = require('path');
const { writeFile } = require('fs').promises;
const { writeFileSync } = require('fs');

let prettier;
try {
  // Look for the containing project's prettier
  prettier = require.main.require('prettier');
} catch (err) {}

async function prettyMaybe(fileName, code, { requireConfig = true } = {}) {
  if (prettier) {
    const ignorePath = await memoizedFindFileUp(
      '.prettierignore',
      pathModule.dirname(fileName)
    );
    const { inferredParser, ignored } = await prettier.getFileInfo(fileName, {
      resolveConfig: true,
      ignorePath
    });
    if (!ignored) {
      const prettierConfig = await prettier.resolveConfig(fileName);
      if (prettierConfig || !requireConfig) {
        code = prettier.format(code, {
          parser: inferredParser,
          ...prettierConfig
        });
      }
    }
  }
  return code;
}

prettyMaybe.sync = function prettyMaybe(
  fileName,
  code,
  { requireConfig = true } = {}
) {
  if (prettier) {
    const ignorePath = memoizedFindFileUpSync(
      '.prettierignore',
      pathModule.dirname(fileName)
    );
    const { inferredParser, ignored } = prettier.getFileInfo.sync(fileName, {
      resolveConfig: true,
      ignorePath
    });
    if (!ignored) {
      const prettierConfig = prettier.resolveConfig.sync(fileName);
      if (prettierConfig || !requireConfig) {
        code = prettier.format(code, {
          parser: inferredParser,
          ...prettierConfig
        });
      }
    }
  }
  return code;
};

prettyMaybe.writeFile = async function(fileName, code, options) {
  return writeFile(fileName, await prettyMaybe(fileName, code, options));
};

prettyMaybe.writeFile.sync = prettyMaybe.writeFileSync = function(
  fileName,
  code,
  options
) {
  return writeFileSync(fileName, prettyMaybe.sync(fileName, code, options));
};

module.exports = prettyMaybe;
