var gulp = require('gulp')
var getEnabledTasks = require('../lib/getEnabledTasks')
const clean = require('./clean.js')
const runLinter = require('./lint.js')
const rev = require('./rev/index.js')
const staticTask = require('./static.js')

function assetCodeTasks(cb) {
  var tasks = getEnabledTasks('production')
  console.log("assetCodeTask")
  gulp.series(tasks.assetTasks, tasks.codeTasks)
}

var productionTask = gulp.series(clean,runLinter,assetCodeTasks,rev,staticTask)

gulp.task('production', productionTask)
module.exports = productionTask
