const R = require('ramda');
const path = require('path');

/**
 * Configures the lib object with the webpack compiler
 * and the plugin options. Returns object of lib functions.
 * @param {*} opts
 * @param {Object} opts.compiler The webpack compiler.
 * @param {Object} opts.options The plugin options.
 * @return {Object} The lib functions.
 */
const createLib = function createLib(opts) {
  const compiler = opts.compiler;
  const compilation = opts.compilation;
  const options = opts.options;
  const webpackConf = compiler.options;
  const dest = webpackConf.output.path;
  const isTest = options.test;

  //const fs = isTest ? compilation.compiler.outputFileSystem : require('fs');
  //const fs = compilation.compiler.outputFileSystem;

  //console.log(fs.constructor.name)

  /**
   * Convert obj to string of key=val pairs
   * @param {*} obj
   */
  const objToString = (obj) => {
    const keys = Object.keys(obj);
    return keys.reduce((acc, val) => {
      let newAcc = acc;
      newAcc += `${val}="${obj[val]}" `;
      return newAcc;
    }, '').trim();
  };

  // Helpers fns to get tagProps data.
  const getTagProps = R.curry((type, opts) => R.pathOr({}, [type, 'tagProps'], opts));
  const getJsTagProps = getTagProps('js');
  const getCssTagProps = getTagProps('css');

/**
   * Creates the snippet of html needed for a built asset.
   * @param {*} assetName The filename of the js/css asset.
   */
  const createAssetTagCurried = R.curry((opts, assetName) => {
    const ext = path.extname(assetName);
    const tagPropsJs = getJsTagProps(opts);
    const tagPropsCss = getCssTagProps(opts);

    if (ext === '.js') {
      const tagPropsString = `src="${assetName}" ${objToString(tagPropsJs)}`.trim();
      return {
        ext,
        tag: `<script ${tagPropsString}></script>`,
      };
    }

    // Otherwise, css.
    const tagPropsString = `rel="stylesheet" type="text/css" href="${assetName}" ${objToString(tagPropsCss)}`.trim();

    return {
      ext,
      tag: `<link ${tagPropsString}>`,
    };
  });

  const isJSorCSS = fileName => path.extname(fileName) === '.js' || path.extname(fileName) === '.css';
  const getWebpackAssets = compilation => Object.keys(compilation.assets);

  /**
   * Get fully resolved path to html fragments.
   * @param {*} tagMeta
   * @param {*} destDir
   */
  const getDestinationPath = function (tagMeta, destDir) {
    const ext = tagMeta.ext.slice(1); // pull off the leading '.'
    const filename = R.pathOr(`assets.${ext}.html`, [ext, 'filename'], options);
    return path.resolve(destDir, filename);
  };

  /**
   * Writes the tag to destDir.
   * @param {Object} tagMeta
   * @param {String} destDir
   */
  const writeTags = function (tagMeta, destDir) {
    const destinationPath = getDestinationPath(tagMeta, destDir);

    // if exists, append, otherwise create
    if (fs.existsSync(destinationPath)) {
      // appendFileSync doesn't exist in memory-fs, improvise.
      let content = fs.readFileSync(destinationPath, 'utf8');
      content += `\r\n${tagMeta.tag}`;
      fs.writeFileSync(destinationPath, content);
    } else {
      fs.writeFileSync(destinationPath, tagMeta.tag);
    }
  };


  /**
   * Write array of html tags to the dest directory.
   * @param {Array} assetHTMLTags
   */
  const writeHtmlTagsCurried = R.curry((destDir, options, assetHTMLTags) => {
    assetHTMLTags.forEach((tagMeta) => {
      writeTags(tagMeta, destDir, assetHTMLTags);
    });
  });

  /**
   * Delete all HTML fragments in build dir.
   */
  // const deletePreviousHtmlTags = () => {
  //   //try {
  //     //fs.statSync(dest);
  //     fs.readdirSync(dest).forEach((file) => {
  //     if (path.extname(file) === '.html') {
  //       fs.unlinkSync(path.resolve(dest, file));
  //     }
  //   });
  //   //} 
  // // catch (e) {
  // //     console.warn('Destination does not exist.');
  // //   }
  // };

  const writeHtmlTags = writeHtmlTagsCurried(dest, options);
  const createAssetTag = createAssetTagCurried(options);
  const createJsCSSTags = assets => assets.filter(isJSorCSS).map(createAssetTag);

  /**
   * Helper to look at intermediate results in compose chain.
   * E.g., R.compose(func1, log, func2)  <-- Logs results from func2.
   */
  // const log = R.tap(console.log);

  /**
   * The main function that:
   *    Gets webpack built assets -> creates the tags -> writes to file.
   */
  const writeAssetTags = R.compose(
    //writeHtmlTags,    //                       write tags to html fragments.
    //R.tap(deletePreviousHtmlTags), //    delete previous html fragments ^
    createJsCSSTags,  //            create tags then ^
    getWebpackAssets  // get assets then ^
  );

  const addAssetFragments = R.compose(
    createJsCSSTags,  //            create tags then ^
    getWebpackAssets  // get assets then ^
  );

  /* 
    {
      app.bundle.js: {},
      app.bundle.css: {}
    }
  
  */


  return {

    // The main function called from AssetTagPlugin.
    writeAssetTags,

    addAssetFragments,

    // Utility functions. Exported for testability.
    objToString,
    createAssetTagCurried,
    isJSorCSS,
    getWebpackAssets,
    writeHtmlTagsCurried,
  };
};

module.exports = createLib;
