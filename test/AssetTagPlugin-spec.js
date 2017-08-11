const assert = require('assert');
//const FS = require('memory-fs');
const AssetTagPlugin = require('../src/AssetTagPlugin');

/**
   * Test helper to create a wepback compiler stub.
   * @param {Object} options Options object to configure compiler stub.
   * @param {Object} options.assets The object of compiled assets from WP.
   * @param {String} options.destDir The output directory from WP conf.
   */
const createCompilerStub = function createCompilerStub(options) {
  // Create a new file system.
  //const fs = new FS();

  // Destination directory
  // if (options && options.destDir) {
  //   fs.mkdirpSync(options.destDir);
  // }

  // Stub compilation
  const compilation = {
    assets: options.assets,
    compiler: {
      
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
      callback(options.compilation, () => {});
    }
  };
};

describe('AssetTagPlugin', () => {
  //const defaultJSHtmlFile = `${destDir}/assets.js.html`;
  //const defaultCSSHtmlFile = `${destDir}/assets.css.html`;

  it('is a function', () => {
    assert.equal(typeof AssetTagPlugin, 'function');
  });

  it('contains an apply method', () => {
    const instance = new AssetTagPlugin({
      test: true,
    });
    assert.equal(typeof instance.apply, 'function');
  });

  it.only('adds js, css asset fragment tags to compilation', () => {
    const instance = new AssetTagPlugin();

    // Results of webpack compile.
    let compilation = {
      assets: {
        'app1.bundle.js': {},
        'app2.bundle.js': {},
        'app1.bundle.css': {},
        'app2.bundle.css': {}
      },
    };

    const compiler = createCompilerStub({
      compilation: compilation
    });

    // Webpack call to plugin's apply
    instance.apply(compiler);

    const expectedJs = [
      `<script src="app1.bundle.js"></script>`,
      `<script src="app2.bundle.js"></script>`
    ].join("\n");

    const expectedCss = [
      `<link rel="stylesheet" type="text/css" href="app1.bundle.css">`,
      `<link rel="stylesheet" type="text/css" href="app2.bundle.css">`
    ].join("\n");

    assert.equal(compilation.assets['assets.css.html'].source(), expectedCss);
  });

  it('creates fragments with js and css tags', () => {
    const instance = new AssetTagPlugin({ test: true });

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
      test: true,
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
      test: true,
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
      test: true,
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


    const instance = new AssetTagPlugin({ test: true });

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert(content.includes('app1.bundle.js'));
    assert(content.includes('app2.bundle.js'));
    assert(content.includes('app3.bundle.js'));
    assert(content.includes('app4.bundle.js'));
  });

  it('defaults correctly if bad options passed in', () => {
    const compiler = createCompilerStub({
      assets: {
        'app1.bundle.js': {},
      },
      destDir,
    });

    const instance = new AssetTagPlugin({
      test: true,
      js: 2,
      css: {
        x: 4,
      },
    });

    instance.apply(compiler);
    const content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert(content.includes('app1.bundle.js'));
  });

  it('uses node fs if not in test mode', () => {
    const compiler = createCompilerStub({
      assets: {
        'app1.bundle.js': {},
      },
      destDir,
    });

    const instance = new AssetTagPlugin();

    assert.throws(() => {
      instance.apply(compiler);
    }, /Error: ENOENT/);
  });

  it('deletes html fragments in between builds', () => {
    const instance = new AssetTagPlugin({
      test: true,
    });

    const compiler = createCompilerStub({
      assets: {
        'app.bundle.js': {},
      },
      destDir,
    });

    // Compile once
    instance.apply(compiler);
    let content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert.equal('<script src="app.bundle.js"></script>', content);

    // Compile twice
    instance.apply(compiler);
    content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert.equal('<script src="app.bundle.js"></script>', content);
  });

  it("doesn't error if the dest dir doesn't exist.", () => {
    const instance = new AssetTagPlugin({
      test: true,
    });

    const compiler = createCompilerStub({
      assets: {
        'app.bundle.js': {},
      },
      destDir: ''
      //destDir,
    });

    // Compile once
    instance.apply(compiler);
    let content = compiler.fs.readFileSync(defaultJSHtmlFile, 'utf8');
    assert.equal('<script src="app.bundle.js"></script>', content);
  });
});
