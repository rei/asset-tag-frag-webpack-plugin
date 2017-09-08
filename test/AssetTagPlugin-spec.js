const assert = require('assert');
const AssetTagPlugin = require('../src/AssetTagPlugin');

/**
 * Test helper to create a wepback compiler stub.
 * @param {Object} options Options object to configure compiler stub.
 * @param {Object} options.assets The object of compiled assets from WP.
 */
const createCompilerStub = function createCompilerStub(options) {
  // Stub compilation
  const compilation = {
    assets: options.assets,
    compiler: {},
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
      callback(options.compilation, () => {});
    },
  };
};

describe('AssetTagPlugin', () => {
  const defaultJSHtmlFile = 'assets.js.html';
  const defaultCSSHtmlFile = 'assets.css.html';

  it('is a function', () => {
    assert.equal(typeof AssetTagPlugin, 'function');
  });

  it('contains an apply method', () => {
    const instance = new AssetTagPlugin({
      test: true,
    });
    assert.equal(typeof instance.apply, 'function');
  });

  it('adds js and css asset fragment tags to compilation', () => {
    const instance = new AssetTagPlugin();

    // Results of webpack compile.
    const compilation = {
      assets: {
        'app1.bundle.js': {},
        'app2.bundle.js': {},
        'app1.bundle.css': {},
        'app2.bundle.css': {},
      },
    };

    const compiler = createCompilerStub({
      compilation,
    });

    // Webpack call to plugin's apply
    instance.apply(compiler);

    const expectedJS = [
      '<script src="app1.bundle.js"></script>',
      '<script src="app2.bundle.js"></script>',
    ].join('\n');

    const expectedCss = [
      '<link rel="stylesheet" type="text/css" href="app1.bundle.css">',
      '<link rel="stylesheet" type="text/css" href="app2.bundle.css">',
    ].join('\n');

    assert.equal(compilation.assets[defaultCSSHtmlFile].source(), expectedCss);
    assert.equal(compilation.assets[defaultCSSHtmlFile].size(), 1);

    assert.equal(compilation.assets[defaultJSHtmlFile].source(), expectedJS);
    assert.equal(compilation.assets[defaultJSHtmlFile].size(), 1);
  });

  it('adds css (only) asset fragment tags to compilation', () => {
    const instance = new AssetTagPlugin();

    // Results of webpack compile.
    const compilation = {
      assets: {
        'app1.bundle.css': {},
      },
    };

    const compiler = createCompilerStub({
      compilation,
    });

    // Webpack call to plugin's apply
    instance.apply(compiler);

    const expectedCss = [
      '<link rel="stylesheet" type="text/css" href="app1.bundle.css">',
    ].join('\n');

    assert.equal(compilation.assets[defaultCSSHtmlFile].source(), expectedCss);
    assert.equal(compilation.assets[defaultCSSHtmlFile].size(), 1);
  });

  it('allows renaming of fragment file', () => {
    const instance = new AssetTagPlugin({
      js: {
        filename: 'js-tags.html',
      },
    });

    // Results of webpack compile.
    const compilation = {
      assets: {
        'app1.bundle.js': {},
      },
    };

    const compiler = createCompilerStub({
      compilation,
    });

    // Webpack call to plugin's apply
    instance.apply(compiler);

    const expected = [
      '<script src="app1.bundle.js"></script>',
    ].join('\n');

    assert.equal(compilation.assets['js-tags.html'].source(), expected);
  });

  it('creates js tag with attributes', () => {
    const instance = new AssetTagPlugin({
      js: {
        tagProps: {
          id: 'x',
        },
      },
    });

    // Results of webpack compile.
    const compilation = {
      assets: {
        'app1.bundle.js': {},
      },
    };

    const compiler = createCompilerStub({
      compilation,
    });

    // Webpack call to plugin's apply
    instance.apply(compiler);

    const expected = [
      '<script src="app1.bundle.js" id="x"></script>',
    ].join('\n');

    assert.equal(compilation.assets[defaultJSHtmlFile].source(), expected);
  });

  it('defaults correctly if bad options passed in', () => {
    const instance = new AssetTagPlugin({
      js: 2,
      css: {
        x: 4,
      },
    });

    // Results of webpack compile.
    const compilation = {
      assets: {
        'app1.bundle.js': {},
      },
    };

    const compiler = createCompilerStub({
      compilation,
    });

    // Webpack call to plugin's apply
    instance.apply(compiler);

    const expected = [
      '<script src="app1.bundle.js"></script>',
    ].join('\n');

    assert.equal(compilation.assets[defaultJSHtmlFile].source(), expected);
  });

  it('prepends path to asset with prependPath option', () => {
    const instance = new AssetTagPlugin({
      js: {
        prependPath: '/static',
      },
      css: {
        prependPath: '/static',
      },
    });

    // Results of webpack compile.
    const compilation = {
      assets: {
        'app.bundle.js': {},
        'app.bundle.css': {},
      },
    };

    const compiler = createCompilerStub({
      compilation,
    });

    // Webpack call to plugin's apply
    instance.apply(compiler);

    const expectedJs = [
      '<script src="/static/app.bundle.js"></script>',
    ].join('\n');

    assert.equal(compilation.assets[defaultJSHtmlFile].source(), expectedJs);

    const expectedCss = [
      '<link rel="stylesheet" type="text/css" href="/static/app.bundle.css">',
    ].join('\n');

    assert.equal(compilation.assets[defaultCSSHtmlFile].source(), expectedCss);
  });
});
