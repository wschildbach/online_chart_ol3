const {series} = require('gulp')
const clean = require('./clean.js')
const runLinter = require('./lint.js')
const rev = require('./rev/index.js')
const _ = require('./static.js')

var getEnabledTasks = require('../lib/getEnabledTasks')

function productionTask(cb) {
  var tasks = getEnabledTasks('production')
  series('clean', 'lint', tasks.assetTasks, tasks.codeTasks, 'rev', 'static',cb)
  cb()
}

module.production = productionTask
module.exports = productionTask
