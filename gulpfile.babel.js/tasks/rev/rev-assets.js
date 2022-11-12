var config = require('../../config')
var {task,src,dest} = require('gulp')
var path = require('path')
var {rev} = require('gulp-rev')
var revNapkin = require('gulp-rev-napkin')

// 1) Add md5 hashes to assets referenced by CSS and JS files
task('rev-assets', function () {
  // Ignore files that may reference assets. We'll rev them next.
  var ignoreThese = '!' + path.join(config.root.dest, '/**/*+(css|js|json|html)')

  return src([path.join(config.root.dest, '/**/*'), ignoreThese])
    .pipe(rev())
    .pipe(dest(config.root.dest))
    .pipe(revNapkin({verbose: false}))
    .pipe(rev.manifest(path.join(config.root.dest, 'rev-manifest.json'), {merge: true}))
    .pipe(dest(''))
})
