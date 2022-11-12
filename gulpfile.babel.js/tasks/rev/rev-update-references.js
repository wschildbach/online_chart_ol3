var config = require('../../config')
var {src,dest,task} = require('gulp')
var path = require('path')
var revReplace = require('gulp-rev-replace')

// 2) Update asset references with reved filenames in compiled css + js
task('rev-update-references', function () {
  var manifest = src(path.join(config.root.dest, 'rev-manifest.json'))

  return src(path.join(config.root.dest, '/**/**.{css,js}'))
    .pipe(revReplace({manifest: manifest}))
    .pipe(dest(config.root.dest))
})
