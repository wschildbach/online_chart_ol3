var logger = require('../lib/compileLogger')
var webpack = require('webpack')

var webpackProductionTask = function (callback) {
  webpack(config, function (err, stats) {
    logger(err, stats)
    callback()
  })
}

module.exports = webpackProductionTask
