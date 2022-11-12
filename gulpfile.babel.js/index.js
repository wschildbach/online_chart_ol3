/*
  gulpfile.js
  ===========
  Rather than manage one giant configuration file responsible
  for creating multiple tasks, each task has been broken out into
  its own file in gulpfile.js/tasks. Any files in that directory get
  automatically required below.

  To add a new task, simply add a new task file that directory.
  gulpfile.js/tasks/default.js specifies the default set of tasks to run
  when you run `gulp`.
*/

const { src, dest, series } = require("gulp");
//var requireDir = require('require-dir')

// Require all tasks in gulpfile.js/tasks, including subfolders
//requireDir('./tasks', { recurse: true })
const production = require('./tasks/production.js')
const clean = require('./tasks/clean.js')
const css = require('./tasks/css.js')
const runLinter = require('./tasks/lint.js')
const staticTask = require('./tasks/static.js')
const intl = require('./tasks/intl.js')
const watch = require('./tasks/watch.js')
const deploy = require('./tasks/deploy.js')
const htmlTask = require('./tasks/html.js')
const images = require('./tasks/images.js')
const webpackProductionTask = require("./tasks/webpackProduction.js");
const rev = require('./tasks/rev/index.js');



exports.clean = clean
exports.lint  = runLinter
exports.deploy = deploy
exports.production = production
exports.images = images
exports.html = htmlTask
exports["webpack:production"] = webpackProductionTask
exports.rev = rev
exports.static = staticTask

exports.default = series(clean,runLinter,staticTask)
//exports.default = series(clean,runLinter,staticTask,intl,watch)
