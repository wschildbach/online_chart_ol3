//var {config} = require('../config')

//var {browserSync} = require('browser-sync')
//var {changed} = require('gulp-changed')
var {src,dest} = require('gulp')
//import imagemin from 'gulp-imagemin';
//var {imagemin} = require('gulp-imagemin')
var path = require('path')
/*
var paths = {
  src: path.join(config.root.src, config.tasks.images.src, '/**'),
  dest: path.join(config.root.dest, config.tasks.images.dest)
}
*/
function images(cb) {
  /*
  return src(paths.src)
    .pipe(changed(paths.dest)) // Ignore unchanged files
    .pipe(imagemin()) // Optimize
    .pipe(dest(paths.dest))
    .pipe(browserSync.stream())
    .on('end', function() {
      cb();
    });
    */
   cb();
}

module.exports = images
