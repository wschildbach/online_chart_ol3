//const {deleteSync,deleteAsync} = require('del')
var config = require('../config')

function clean(cb) {
  console.log("cleanTask not working at the moment")
/*
  deleteAsync([config.root.dest]).then(function (paths) {
    cb();
  })
*/
  cb();
}

module.exports = clean
