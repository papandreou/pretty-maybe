# pretty-maybe

[![NPM version](https://badge.fury.io/js/pretty-maybe.svg)](http://badge.fury.io/js/pretty-maybe)
[![Build Status](https://travis-ci.org/papandreou/pretty-maybe.svg?branch=master)](https://travis-ci.org/papandreou/pretty-maybe)
[![Coverage Status](https://coveralls.io/repos/papandreou/pretty-maybe/badge.svg)](https://coveralls.io/r/papandreou/pretty-maybe)
[![Dependency Status](https://david-dm.org/papandreou/pretty-maybe.svg)](https://david-dm.org/papandreou/pretty-maybe)

Serialize a JavaScript/CSS/markdown/... file, running it through prettier's
programmatic interface if it is configured for the destination path. You have to
tell it the path of the file that you're formatting. This is used to sniff the
file type and to look up the prettier configuration and `.prettierignore`:

```js
const prettyMaybe = require('pretty-maybe');

(async () => {
  const code = await prettyMaybe('/path/to/file.js', 'a=123');
  console.log(code); // a = 123;
})();
```

There is also a sync version:

```js
const code = prettyMaybe.sync('/path/to/file.js', 'a=123');
console.log(code); // a = 123;
```

You can also tell it not to require a prettier configuration file by passing
`requireConfig: false` in the 3rd parameter, which is an options object:

```js
(async () => {
  const code = await prettyMaybe('/path/to/file.js', 'a=123', {
    requireConfig: false
  });
})();
```

It will still require `prettier` to be `require`-able in your project, though.

Since you'll most often want to actually write the file to disc, there's also a `writeFile` function that does that:

```js
(async () => {
  await prettyMaybe.writeFile('/path/to/file.js', 'a=123');
})();
```

As well as a sync version:

```js
prettyMaybe.writeFileSync('/path/to/file.js', 'a=123');
```

Also available as:

```js
prettyMaybe.writeFile.sync('/path/to/file.js', 'a=123');
```

## Rationale

Why is it necessary to have a module like this when you can just use prettier's
programmatic interface directly?

It's just for convenience. I found prettier's programmatic interface to be quite
low level for this basic use case. You have to do several calls and find the
`.prettierignore` file yourself.

## License

3-clause BSD license -- see the `LICENSE` file for details.
