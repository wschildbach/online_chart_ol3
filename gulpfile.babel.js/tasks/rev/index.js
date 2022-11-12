var {series} = require('gulp')
var _f1 = require('./rev-assets')
var _f2 = require('./rev-update-references')
var _f3 = require('./rev-css')
var _f4 = require('./rev-js')
var _f5 = require('./update-html')
var _f6 = require('./sizereport')

// If you are familiar with Rails, this task the equivalent of `rake assets:precompile`
function revTask(cb) {
  series(
    // 1) Add md5 hashes to assets referenced by CSS and JS files
    'rev-assets',
    // 2) Update asset references (images, fonts, etc) with reved filenames in compiled css + js
    'rev-update-references',
    // 3) Rev and compress CSS and JS files (this is done after assets, so that if a referenced asset hash changes, the parent hash will change as well
    'rev-css',
    'rev-js',
    // 4) Update asset references in HTML
    'update-html',
    // 5) Report filesizes
    'size-report',
    cb)
//    cb();
}

module.exports = revTask
