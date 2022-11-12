var config = require('../config')
var ghPages = require('gulp-gh-pages')
const src = require('gulp')
var os = require('os')
var packageData = require('../../package.json')
var path = require('path')

var settings = {
  src: path.join(config.root.dest, '/**/*'),
  ghPages: {
    cacheDir: path.join(os.tmpdir(), packageData.name),
    force: true
  }
}

function deploy(cb) {
  return src(settings.src)
    .pipe(ghPages(settings.ghPages))
    .on('end', function() {
      cb();
    });
}

module.exports = deploy
