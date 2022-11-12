//const {del}    = require('del')
var config = require('../config')

function clean(cb) {
/*
  del([config.root.dest]).then(function (paths) {
    cb();
  })
  */
  cb();
}

module.exports = clean
