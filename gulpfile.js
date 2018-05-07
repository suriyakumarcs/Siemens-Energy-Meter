var gulp = require('gulp'),
plumber = require('gulp-plumber'),
rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin'),
cache = require('gulp-cache');
var minifycss = require('gulp-minify-css');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');

gulp.task('browser-sync', function() {
browserSync.init(null, {
server: {
   baseDir: "./",
},
ghostMode: false,
});
});

gulp.task('bs-reload', function () {
browserSync.reload();
});

gulp.task('images', function(){
gulp.src('assets/images/**/*')
.pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
.pipe(gulp.dest('build/images/'));
});

/**
 * Compile less to css
 * @return {Stream}
 */
gulp.task('styles', function() {  
    return gulp
      //.src(config.less)
      .src('assets/styles/**/*.scss')
      .pipe(plumber()) // exit gracefully if something fails after this
      //.pipe($.less())
      .pipe(sass())
      //        .on('error', errorLogger) // more verbose and dupe output. requires emit.
      .pipe(autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
      .pipe(gulp.dest('build/styles'));
  });

gulp.task('scripts', function(){
return gulp.src('app/**/*.js')
.pipe(plumber({
  errorHandler: function (error) {
    console.log(error.message);
    this.emit('end');
}}))
.pipe(concat('main.js'))
.pipe(gulp.dest('build/js/'))
.pipe(rename({suffix: '.min'}))
.pipe(uglify())
.pipe(gulp.dest('build/js/'))
.pipe(browserSync.reload({stream:true}))
});

gulp.task('default', ['browser-sync'], function() {
gulp.watch("assets/styles/**/*.scss", ['styles']);
gulp.watch("app/**/*.js", ['scripts']);
gulp.watch("*.html", ['bs-reload']);
});
gulp.task('serve-dev', ['images','styles','scripts','default']);
