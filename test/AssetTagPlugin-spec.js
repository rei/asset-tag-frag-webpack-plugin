const assert = require('assert');
const FS = require('memory-fs');
const AssetTagPlugin = require('../src/AssetTagPlugin');

/**
   * Test helper to create a wepback compiler stub.
   * @param {Object} options Options object to configure compiler stub.
   * @param {Object} options.assets The object of compiled assets from WP.
   * @param {String} options.destDir The output directory from WP conf.
   */
const createCompilerStub = function createCompilerStub(options) {
  // Create a new file system.
  const fs = new FS();

  // Destination directory
  fs.mkdirpSync(options.destDir);

  // Stub compilation
  const compilation = {
    assets: options.assets,
    compiler: {
      outputFileSystem: fs,
    },
  };

  // Return the compiler object.
  return {
    // The passed in wp conf.
    options: {
      output: {
        path: options.destDir,
      },
    },

    plugin(event, callback) {
      callback(compilation, () => {});
    },
    fs,
  };
};

describe('AssetTagPlugin', () => {
  const destDir = '/build';
  const defaultJSHtmlFile = `${destDir}/assets.js.html`;
  const defaultCSSHtmlFile = `${destDir}/assets.css.html`;

  it('is a function', () => {
    assert.equal(typeof AssetTagPlugin, 'function');
  });

  it('contains an apply method', () => {
    const instance = new AssetTagPlugin();
    assert.equal(typeof instance.apply, 'function');
  });

  it('creates a fragment with a single js tag', () => {
    const instance = new AssetTagPlugin();

    const compiler = createCompilerStub({
      assets: {
        'app.bundle.js': {},
      },
      destDir,
    });

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert.equal('<script src="app.bundle.js"></script>', content);
  });

  it('creates fragments with js and css tags', () => {
    const instance = new AssetTagPlugin();

    const compiler = createCompilerStub({
      assets: {
        'app.bundle.js': {},
        'app.bundle.css': {},
      },
      destDir,
    });

    instance.apply(compiler);

    // Verify js bundle
    let content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert.equal(content, '<script src="app.bundle.js"></script>');

    // Verify css bundle
    content = compiler.fs.readFileSync(defaultCSSHtmlFile, 'utf8');
    assert.equal(content, '<link rel="stylesheet" type="text/css" href="app.bundle.css">');
  });

  it('allows renaming of fragment file', () => {
    const compiler = createCompilerStub({
      assets: {
        'app.bundle.js': {},
      },
      destDir,
    });

    const instance = new AssetTagPlugin({
      js: {
        filename: 'js-tags.html',
      },
    });

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(`${destDir}/js-tags.html`, 'utf8');
    assert.equal('<script src="app.bundle.js"></script>', content);
  });

  it('creates js tag with attributes', () => {
    const compiler = createCompilerStub({
      assets: {
        'app.bundle.js': {},
      },
      destDir,
    });

    const instance = new AssetTagPlugin({
      js: {
        tagProps: {
          id: 'x',
        },
      },
    });

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert.equal('<script src="app.bundle.js" id="x"></script>', content);
  });

  it('creates css tag with attributes', () => {
    const compiler = createCompilerStub({
      assets: {
        'app.bundle.css': {},
      },
      destDir,
    });

    const instance = new AssetTagPlugin({
      css: {
        tagProps: {
          id: 'x',
          class: 'y',
        },
      },
    });

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(defaultCSSHtmlFile, 'utf8');
    assert.equal('<link rel="stylesheet" type="text/css" href="app.bundle.css" id="x" class="y">', content);
  });

  it('creates fragment with multiple assets', () => {
    // Stub compilation
    const compiler = createCompilerStub({
      assets: {
        'app1.bundle.js': {},
        'app2.bundle.js': {},
        'app3.bundle.js': {},
        'app4.bundle.js': {},
      },
      destDir,
    });


    const instance = new AssetTagPlugin();

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert(content.includes('app1.bundle.js'));
    assert(content.includes('app2.bundle.js'));
    assert(content.includes('app3.bundle.js'));
    assert(content.includes('app4.bundle.js'));
  });

  it('defaults correctly if no options passed in', () => {
    const compiler = createCompilerStub({
      assets: {
        'app1.bundle.js': {},
      },
      destDir,
    });

    // No options passed in.
    const instance = new AssetTagPlugin();

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert(content.includes('app1.bundle.js'));
  });

  it('defaults correctly if bad options passed in', () => {
    const compiler = createCompilerStub({
      assets: {
        'app1.bundle.js': {},
      },
      destDir,
    });

    // No options passed in.
    const instance = new AssetTagPlugin("hey, these aren't options!");

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert(content.includes('app1.bundle.js'));
  });
});
