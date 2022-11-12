var browserSync = require('browser-sync')
var config = require('../config')

var browserSyncTask = function () {
  browserSync.init(config.tasks.browserSync)
}

module.exports = browserSyncTask
