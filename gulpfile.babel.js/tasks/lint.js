var config = require('../config')

const {src} = require('gulp')

var path = require('path')
var eslint = require('gulp-eslint')

var options = (config.tasks.lint && config.tasks.lint.options) ? config.tasks.lint.options : {}

function runLinter(cb) {
  var jsSrc = path.resolve(config.root.src, config.tasks.js.src);
  return src([jsSrc + '/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('end',function() {
      cb();
    });
}

module.exports = runLinter
