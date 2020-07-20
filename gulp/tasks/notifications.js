const config = require('../config');
const gulp = require('gulp');
const path = require('path');
const sass = require('gulp-sass');
const size = require('gulp-size');
const postcss = require('gulp-postcss');
const debug = require('gulp-debug');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const mergeStream = require('merge-stream');
const colors = require('ansi-colors');
const log = require('fancy-log');

const sassOptions = {
  outputStyle: 'compressed',
  precision: 10,
  errLogToConsole: true // else watch breaks
};

const postcssPlugins = [
  autoprefixer(), // Browsers pulled from .browserslistrc
  cssnano({
    discardUnused: true, // don't discard unused at-rules (@keyframes for example that aren't used)
    zindex: false, // don't optimize z-index stacking... very dangerous
    autoprefixer: false // don't remove unnecessary prefixes. we're setting this above
  })
];

gulp.task('notifications', () => {
  return gulp.src(config.tasks.notifications.src)
    .pipe(sass(sassOptions))
    .on('error', function(error) {
      log.error(`${colors.bold.red('SCSS Compilation Error')}: ${error.message}`);
      this.emit('end');
    })
    .pipe(postcss(postcssPlugins))
    .pipe(rename({
      extname: '.min.css'
    }))    
    .pipe(gulp.dest(config.tasks.notifications.dest))
    .pipe(debug())
    .pipe(size({showFiles: true, title: 'CSS: size of'}));
});