var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var path = require('path');
var changed = require('gulp-changed');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var sass = require('gulp-sass');
var config = require(path.join(__dirname, 'config.json'));

var opts = config.opts;

if(opts.reactify)
  var reactify = require('reactify');
if(opts.sourcemaps)
  var sourcemaps = require('gulp-sourcemaps');

gulp.task('scripts', function() {
  var bundler = browserify(path.join(__dirname, opts.src, opts.browserifyIndexFile))

  if(opts.reactify)
    bundler.transform('reactify');

  return bundler
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(path.join(__dirname, opts.dist)));
});

gulp.task('watch-scripts', function() {
  var bundler = watchify(browserify(path.join(__dirname, opts.src, opts.browserifyIndexFile), watchify.args));

  if(opts.reactify)
    bundler.transform('reactify');

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(path.join(__dirname, opts.dist)))
    .pipe(reload({ stream: true }));
  }

  return rebundle();
});

gulp.task('styles', function() {
  if(!sourcemaps) {
    gulp.src(path.join(__dirname, opts.src, opts.sassDir, '*.scss'))
      .pipe(sass())
      .pipe(gulp.dest(path.join(__dirname, opts.dist, opts.cssDir)))
      .pipe(reload({ stream: true }));
  }else {
    gulp.src(path.join(__dirname, opts.src, opts.sassDir, '*.scss'))
      .pipe(sourcemaps.init())
        .pipe(sass())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path.join(__dirname, opts.dist, opts.cssDir)))
      .pipe(reload({ stream: true }));
  }
});

gulp.task('html', function() {
  gulp.src(path.join(__dirname, opts.src, opts.htmlDir, '**', '*.html'))
    .pipe(changed(path.join(__dirname, opts.dist)))
    .pipe(gulp.dest(path.join(__dirname, opts.dist)));
});

gulp.task('browser-sync', ['build'], function() {
  browserSync({
    server: {
      baseDir: path.join(__dirname, opts.dist)
    }
  });
});

gulp.task('watch', ['build', 'browser-sync'], function() {
  gulp.watch(path.join(__dirname, opts.src, opts.htmlDir, '**', '*.html'), ['html', reload]);
  gulp.watch(path.join(__dirname, opts.src, opts.sassDir, '**', '*.scss'), ['styles']);
  gulp.watch(path.join(__dirname, opts.src, '**', '*.jsx'), ['watch-scripts']);
});

gulp.task('build', ['scripts', 'styles', 'html']);
gulp.task('default', ['watch']);
