const {series} = require('gulp')
const clean = require('./clean.js')
const runLinter = require('./lint.js')
var getEnabledTasks = require('../lib/getEnabledTasks')

function productionTask(cb) {
  var tasks = getEnabledTasks('production')
  series('clean', 'lint', tasks.assetTasks, tasks.codeTasks, 'rev', 'static')
  cb()
}

module.production = productionTask
module.exports = productionTask
