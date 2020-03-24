const expect = require('unexpected');
const prettyMaybe = require('../lib/pretty-maybe.js');
const { mkdir, writeFile, readFile } = require('fs').promises;
const pathModule = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

describe('pretty-maybe', function () {
  let tmpDir;
  let nextTmpDirNumber = 1;
  beforeEach(async () => {
    tmpDir = pathModule.resolve(
      require('os').tmpdir(),
      `pretty-maybe-test-${Date.now()}-${process.pid}-${nextTmpDirNumber++}`
    );
    await mkdir(tmpDir);
  });
  afterEach(async () => {
    await rimraf(tmpDir);
  });

  it('should return a promise', async function () {
    const fileName = pathModule.resolve(tmpDir, 'myFile.js');
    const returnValue = prettyMaybe(fileName, 'a="b"');
    expect(returnValue, 'to be a', 'Promise');
    await returnValue;
  });

  describe('when prettier is available', function () {
    describe('with config', function () {
      beforeEach(async function () {
        await writeFile(
          pathModule.resolve(tmpDir, '.prettierrc'),
          '{"singleQuote": true}'
        );
      });

      it('should format JavaScript with prettier according to the config', async function () {
        const fileName = pathModule.resolve(tmpDir, 'myFile.js');
        const code = await prettyMaybe(fileName, 'a="b"');
        expect(code, 'to equal', "a = 'b';\n");
      });

      it('should format JSON with prettier according to the config', async function () {
        const fileName = pathModule.resolve(tmpDir, 'myFile.json');
        const code = await prettyMaybe(fileName, '{  "foo":123  }');
        expect(code, 'to equal', '{ "foo": 123 }\n');
      });

      describe('with .prettierignore', function () {
        beforeEach(async function () {
          await writeFile(
            pathModule.resolve(tmpDir, '.prettierignore'),
            'myIgnoredFile.js\n'
          );
        });

        it('should leave an ignored file unchanged', async function () {
          const fileName = pathModule.resolve(tmpDir, 'myIgnoredFile.js');
          const code = await prettyMaybe(fileName, 'a="b"');
          expect(code, 'to equal', 'a="b"');
        });

        it('should format a file that is not ignored', async function () {
          const fileName = pathModule.resolve(tmpDir, 'myFile.js');
          const code = await prettyMaybe(fileName, 'a="b"');
          expect(code, 'to equal', "a = 'b';\n");
        });
      });
    });

    describe('without config', function () {
      it('should write the data unchanged', async function () {
        const fileName = pathModule.resolve(tmpDir, 'myFile.js');
        const code = await prettyMaybe(fileName, 'a="b"');
        expect(code, 'to equal', 'a="b"');
      });

      describe('with requireConfig:false', function () {
        it('should format with prettier', async function () {
          const fileName = pathModule.resolve(tmpDir, 'myFile.js');
          const code = await prettyMaybe(fileName, 'a="b"', {
            requireConfig: false,
          });
          expect(code, 'to equal', 'a = "b";\n');
        });
      });
    });
  });

  describe('sync', function () {
    describe('when prettier is available', function () {
      describe('with config', function () {
        beforeEach(async function () {
          await writeFile(
            pathModule.resolve(tmpDir, '.prettierrc'),
            '{"singleQuote": true}'
          );
        });

        it('should format with prettier according to the config', async function () {
          const fileName = pathModule.resolve(tmpDir, 'myFile.js');
          const code = prettyMaybe.sync(fileName, 'a="b"');
          expect(code, 'to equal', "a = 'b';\n");
        });

        describe('with .prettierignore', function () {
          beforeEach(async function () {
            await writeFile(
              pathModule.resolve(tmpDir, '.prettierignore'),
              'myIgnoredFile.js\n'
            );
          });

          it('should leave an ignored file unchanged', async function () {
            const fileName = pathModule.resolve(tmpDir, 'myIgnoredFile.js');
            const code = prettyMaybe.sync(fileName, 'a="b"');
            expect(code, 'to equal', 'a="b"');
          });

          it('should format a file that is not ignored', async function () {
            const fileName = pathModule.resolve(tmpDir, 'myFile.js');
            const code = prettyMaybe.sync(fileName, 'a="b"');
            expect(code, 'to equal', "a = 'b';\n");
          });
        });
      });

      describe('without config', function () {
        it('should write the data unchanged', async function () {
          const fileName = pathModule.resolve(tmpDir, 'myFile.js');
          const code = prettyMaybe.sync(fileName, 'a="b"');
          expect(code, 'to equal', 'a="b"');
        });

        describe('with requireConfig:false', function () {
          it('should format with prettier', async function () {
            const fileName = pathModule.resolve(tmpDir, 'myFile.js');
            const code = prettyMaybe.sync(fileName, 'a="b"', {
              requireConfig: false,
            });
            expect(code, 'to equal', 'a = "b";\n');
          });
        });
      });
    });
  });

  describe('writeFile', function () {
    describe('with config', function () {
      beforeEach(async function () {
        await writeFile(
          pathModule.resolve(tmpDir, '.prettierrc'),
          '{"singleQuote": true}'
        );
      });

      it('should format with prettier according to the config and write the file', async function () {
        const fileName = pathModule.resolve(tmpDir, 'myFile.js');
        await prettyMaybe.writeFile(fileName, 'a="b"');
        expect(await readFile(fileName, 'utf-8'), 'to equal', "a = 'b';\n");
      });
    });

    describe('sync', function () {
      describe('with config', function () {
        beforeEach(async function () {
          await writeFile(
            pathModule.resolve(tmpDir, '.prettierrc'),
            '{"singleQuote": true}'
          );
        });

        it('should format with prettier according to the config and write the file', async function () {
          const fileName = pathModule.resolve(tmpDir, 'myFile.js');
          prettyMaybe.writeFile.sync(fileName, 'a="b"');
          expect(await readFile(fileName, 'utf-8'), 'to equal', "a = 'b';\n");
        });
      });
    });
  });
});
