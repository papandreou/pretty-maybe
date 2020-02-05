const findFileUp = require('find-file-up');
const memoizeSync = require('memoizesync');
const memoizedFindFileUp = memoizeSync(findFileUp.promise);
const memoizedFindFileUpSync = memoizeSync(findFileUp.sync);
const pathModule = require('path');

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

module.exports = prettyMaybe;
