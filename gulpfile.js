var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var path = require('path');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');

/**
 * OPTIONS
 */
var opts = {
  src: 'src',
  dist: 'dist',
  htmlDir: 'html',
  imgDir: 'img',
  cssiDir: 'css',
  jsonDir: 'json',
  fontDir: 'font',
  browserifyIndexFile: 'index.jsx',

  // optionals
  reactify: true,
  sass: true,
  sassDir: 'sass'
};

if(opts.reactify)
  var reactify = require('reactify');

gulp.task('scripts', function() {
  var bundler = watchify(browserify(path.join(__dirname, opts.src, opts.browserifyIndexFile), watchify.args));

  if(opts.reactify)
    bundler.transform('reactify');

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(path.join(__dirname, opts.dist)));
  }

  return rebundle();
});

gulp.task('html', function() {
  gulp.src(path.join(__dirname, opts.src, opts.htmlDir, '**', '*.html'))
    .pipe(gulp.dest(path.join(__dirname, opts.dist)));
});

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: path.join(__dirname, opts.dist)
    }
  });
});
