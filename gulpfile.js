var gulp = require('gulp');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var saveLicense = require('uglify-save-license');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');


gulp.task('Sass', function () {
  return gulp
    .src('./src/scss/color-picker.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({outputStyle: 'compressed'})
        .on("error", notify.onError(function(error) {
          return "Error: " + error.message;
        }))
    )
    .pipe(autoprefixer({
      browsers: ['last 3 versions', 'ie <= 10', 'iOS <= 7', 'Firefox >= 28', 'Chrome >=24']
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(
      notify("Sass Compiled Successfully")
    );
});

gulp.task('MainJS', function(){
  return gulp.src([
    './src/js/main.js'
    , './src/js/modules/**/*.js'
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('color-picker.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(
      uglify({
        output: {
          comments: saveLicense
        }
      }).on("error", notify.onError(function(error){
        return "Error: " + error.message;
      }))
    )
    .pipe(rename({extname:'.min.js'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(
      notify("JS Compiled Successfully")
    );
});

gulp.task( 'watch', function(){
  gulp.watch('./src/scss/**/*', gulp.series('Sass') );
  gulp.watch('./src/js/**/*', gulp.series('MainJS') );
} );

gulp.task('default', gulp.parallel('watch', 'Sass', 'MainJS') );
