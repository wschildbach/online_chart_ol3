var config = require('../config')
var changed = require('gulp-changed')
const {src,dest} = require('gulp')
var path = require('path')

var paths = {
  src: path.join(config.root.src, config.tasks.static.src, '/**'),
  dest: path.join(config.root.dest, config.tasks.static.dest)
}

var staticTask = function (cb) {
  src(paths.src)
    .pipe(changed(paths.dest)) // Ignore unchanged files
    .pipe(dest(paths.dest))
    .on('end', function () {
      cb();
    });
}

module.exports = staticTask
