var config = require('../config')
var {series} = require('gulp')
const browserSync = require('./browserSync.js')
var path = require('path')
var watch = require('gulp-watch')

var watchTask = function () {
  var watchableTasks = ['images', 'html', 'css']

  watchableTasks.forEach(function (taskName) {
    var task = config.tasks[taskName]
    if (task) {
      var glob = path.join(config.root.src, task.src, '**/*.{' + task.extensions.join(',') + '}')
      watch(glob, function () {
        require('./' + taskName)()
      })
    }
  })
}

module.watch = series(browserSync, watchTask)
module.exports = watchTask
