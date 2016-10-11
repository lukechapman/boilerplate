var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    browserSync = require('browser-sync').create(),
    pug = require('gulp-pug'),
    del = require('del');


var dist = './dist';
var asset_path = dist + '/assets';
var reload = browserSync.reload;

gulp.task('css-dev', function() {
    return sass('working/scss/main.scss', { style: 'expanded' })
        .pipe(autoprefixer('last 3 versions'))
        .pipe(gulp.dest(asset_path+'/css'))
        .pipe(notify({ message: 'CSS dev complete' }))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('css-live', function() {
    return sass('working/scss/main.scss', { style: 'expanded' })
        .pipe(autoprefixer('last 3 versions'))
        .pipe(gulp.dest(asset_path+'/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(gulp.dest(asset_path+'/css'))
        .pipe(notify({ message: 'CSS live complete' }));
});

gulp.task('js-dev', function() {

    gulp.src(['working/js/app.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));

    gulp.src(['working/js/vendor/*.js'])
        .pipe(gulp.dest(asset_path+'/js'));

    gulp.src(['working/js/plugins/*.js', 'working/js/app.js']) 
        .pipe(concat('main.js'))
        .pipe(gulp.dest(asset_path+'/js'))
        .pipe(notify({ message: 'JS dev complete' }))
        .pipe(reload({stream:true}));
});

gulp.task('js-live', function() {

    gulp.src(['working/js/app.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));

    gulp.src(['working/js/vendor/*.js'])
        .pipe(gulp.dest(asset_path+'/js'));

    gulp.src(['working/js/plugins/*.js', 'working/js/app.js'])
        .pipe(concat('main.js'))
        .pipe(gulp.dest(asset_path+'/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(asset_path+'/js'))
        .pipe(notify({ message: 'JS live complete' }));
});

gulp.task('html', function() {
    gulp.src(['working/pug/**/*.pug'])
    .pipe(pug({
        locals: {}
    }))
    .pipe(gulp.dest(dist))
    .pipe(reload({stream:true}));
});

gulp.task('clean', function() {
    return del([asset_path]);
});

gulp.task('default', ['clean'], function() {
    gulp.start('css-dev', 'js-dev', 'html', 'watch', 'browser-sync');
});

gulp.task('live', ['clean'], function() {
    gulp.start('css-live', 'js-live');
});

gulp.task('browser-sync', function(){
  browserSync.init({
    server: {
      baseDir: dist
    },
    notify: {
      styles: {
        right: 'initial',
        top: 'initial',
        bottom: '0',
        left: '0',
        borderBottomLeftRadius: 'initial',
        borderTopRightRadius: '1em'
      }
    }
  });
});

gulp.task('watch', function() {
    // Watch .pug files
    gulp.watch('working/pug/**/*.pug', ['html']);

    // Watch .scss files
    gulp.watch('working/scss/**/**/*.scss', ['css-dev']);

    // Watch .js files
    gulp.watch('working/js/**/**/*.js', ['js-dev']);

});