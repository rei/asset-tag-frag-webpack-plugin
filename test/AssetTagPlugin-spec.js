const assert = require('assert');
const pq = require('proxyquire').noCallThru();
const FS = require('memory-fs');

let fs;
let lib;
let AssetTagPlugin;

/**
   * Test helper to create a wepback compiler stub.
   * @param {*} options
   */
const createCompilerStub = function createCompilerStub(options) {
  // Stub compilation
  const compilation = {
    assets: options.assets,
  };

  // Stub compiler
  const compiler = {

    // The passed in wp conf.
    options: {
      output: {
        path: options.destDir,
      },
    },

    plugin(event, callback) {
      callback(compilation, () => {});
    },
  };
  return compiler;
};


describe('AssetTagPlugin', () => {
  const destDir = '/test';

  beforeEach(() => {
    // Re-instantiate the world.
    fs = new FS();

    // proxyquire the fs in util
    lib = pq('../src/lib', {
      fs,
    });

    // proxyquire plugin
    AssetTagPlugin = pq('../src/AssetTagPlugin', {
      './lib': lib,
    });

    // Destination directory
    fs.mkdirpSync(destDir);
  });

  it('is a function', () => {
    assert.equal(typeof AssetTagPlugin, 'function');
  });

  it('contains an apply method', () => {
    const instance = new AssetTagPlugin();
    assert.equal(typeof instance.apply, 'function');
  });

  it('creates a fragment with a single bundle', () => {
    const instance = new AssetTagPlugin({
      js: {
        filename: 'test.html',
      },
      css: {
        filename: 'test.html',
      },
    });

    const compiler = createCompilerStub({
      assets: {
        'app.bundle.js': {},
      },
      destDir,
    });

    instance.apply(compiler);
    const content = fs.readFileSync('/test/test.html', 'utf8');
    assert.equal('<script src="app.bundle.js" ></script>', content);
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
        filename: 'test.html',
        tagProps: {
          id: 'x',
        },
      },
      css: {
        filename: 'test.html',
      },
    });

    instance.apply(compiler);
    const content = fs.readFileSync('/test/test.html', 'utf8');
    assert.equal('<script src="app.bundle.js" id="x"></script>', content);
  });

  it('creates fragment with 2 assets', () => {
    // Stub compilation
    const compiler = createCompilerStub({
      assets: {
        'app1.bundle.js': {},
        'app2.bundle.js': {},
      },
      destDir,
    });


    const instance = new AssetTagPlugin({
      js: {
        filename: 'test.html',
      },
      css: {
        filename: 'test.html',
      },
    });

    instance.apply(compiler);
    const content = fs.readFileSync('/test/test.html', 'utf8');
    assert(content.includes('app1.bundle.js'));
    assert(content.includes('app2.bundle.js'));
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
    const content = fs.readFileSync('/test/assets.js.html', 'utf8');
    assert(content.includes('app1.bundle.js'));
  });
});
