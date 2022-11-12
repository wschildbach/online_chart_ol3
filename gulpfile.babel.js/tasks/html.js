var config = require('../config')

var browserSync = require('browser-sync')
var {src,dest} = require('gulp')
var gulpif = require('gulp-if')
var handleErrors = require('../lib/handleErrors')
var htmlmin = require('gulp-htmlmin')
var path = require('path')
var render = require('gulp-nunjucks-render')

var exclude = path.normalize('!**/{' + config.tasks.html.excludeFolders.join(',') + '}/**')

var paths = {
  src: [path.join(config.root.src, config.tasks.html.src, '/**/*.html'), exclude],
  dest: path.join(config.root.dest, config.tasks.html.dest)
}

var htmlTask = function (cb) {
  return src(paths.src)
    .on('error', handleErrors)
    .pipe(render({
      path: [path.join(config.root.src, config.tasks.html.src)],
      envOptions: {
        watch: false
      }
    }))
    .on('error', handleErrors)
    .pipe(gulpif(process.env.NODE_ENV === 'production', htmlmin(config.tasks.html.htmlmin)))
    .pipe(dest(paths.dest))
    .pipe(browserSync.stream())
    .on('end', function () {
      cb();
    });
}

module.exports = htmlTask
