const expect = require('unexpected');
const prettyMaybe = require('../');
const { mkdir, writeFile, readFile } = require('fs').promises;
const pathModule = require('path');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const proxyquire = require('proxyquire');

describe('maybe-pretty', function() {
  let tmpDir;
  let nextTmpDirNumber = 1;
  beforeEach(async () => {
    tmpDir = pathModule.resolve(
      require('os').tmpdir(),
      `maybe-pretty-test-${Date.now()}-${process.pid}-${nextTmpDirNumber++}`
    );
    await mkdir(tmpDir);
  });
  afterEach(async () => {
    await rimraf(tmpDir);
  });

  it('should return a promise', async function() {
    const fileName = pathModule.resolve(tmpDir, 'myFile.js');
    const returnValue = prettyMaybe(fileName, 'a="b"');
    expect(returnValue, 'to be a', 'Promise');
    await returnValue;
  });

  describe('when prettier is available', function() {
    describe('with config', function() {
      let configFileName;
      beforeEach(async function() {
        configFileName = pathModule.resolve(tmpDir, '.prettierrc');
        await writeFile(configFileName, '{"singleQuote": true}');
      });

      it('should format with prettier according to the config', async function() {
        const fileName = pathModule.resolve(tmpDir, 'myFile.js');
        const code = await prettyMaybe(fileName, 'a="b"');
        expect(code, 'to equal', "a = 'b';\n");
      });
    });

    describe('without config', function() {
      it('should write the data unchanged', async function() {
        const fileName = pathModule.resolve(tmpDir, 'myFile.js');
        const code = await prettyMaybe(fileName, 'a="b"');
        expect(code, 'to equal', 'a="b"');
      });

      describe('with requireConfig:false', function() {
        it('should format with prettier', async function() {
          const fileName = pathModule.resolve(tmpDir, 'myFile.js');
          const code = await prettyMaybe(fileName, 'a="b"', {
            requireConfig: false
          });
          expect(code, 'to equal', 'a = "b";\n');
        });
      });
    });
  });

  describe('when prettier is unavailable', function() {
    const prettyMaybe = proxyquire('../', {
      prettier: null
    });

    it('should write the data unchanged', async function() {
      const fileName = pathModule.resolve(tmpDir, 'myFile.js');
      const code = await prettyMaybe(fileName, 'a="b"');
      expect(code, 'to equal', 'a="b"');
    });
  });

  describe('sync', function() {
    describe('when prettier is available', function() {
      let configFileName;
      beforeEach(async function() {
        configFileName = pathModule.resolve(tmpDir, '.prettierrc');
        await writeFile(configFileName, '{"singleQuote": true}');
      });

      it('should format with prettier according to the config', async function() {
        const fileName = pathModule.resolve(tmpDir, 'myFile.js');
        const code = prettyMaybe.sync(fileName, 'a="b"');
        expect(code, 'to equal', "a = 'b';\n");
      });
    });

    describe('when prettier is unavailable', function() {
      it('should write the data unchanged', async function() {
        const fileName = pathModule.resolve(tmpDir, 'myFile.js');
        const code = prettyMaybe.sync(fileName, 'a="b"');
        expect(code, 'to equal', 'a="b"');
      });

      describe('without config', function() {
        it('should write the data unchanged', async function() {
          const fileName = pathModule.resolve(tmpDir, 'myFile.js');
          const code = prettyMaybe.sync(fileName, 'a="b"');
          expect(code, 'to equal', 'a="b"');
        });

        describe('with requireConfig:false', function() {
          it('should format with prettier', async function() {
            const fileName = pathModule.resolve(tmpDir, 'myFile.js');
            const code = prettyMaybe.sync(fileName, 'a="b"', {
              requireConfig: false
            });
            expect(code, 'to equal', 'a = "b";\n');
          });
        });
      });
    });
  });
});
