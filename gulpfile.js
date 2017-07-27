var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    pxtorem = require('gulp-pxtorem'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rev = require('gulp-rev'),
    concat = require('gulp-concat'),
    util = require('gulp-util'),
    browserSync = require('browser-sync').create(),
    pug = require('gulp-pug'),
    inject = require('gulp-inject'),
    del = require('del');


var dist = './dist';
var asset_path = dist + '/assets';
var reload = browserSync.reload;

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: dist
        },
        notify: {
            styles: {
                top: 'auto',
                bottom: '0'
            }
        }
    });
});

gulp.task('css:dev', function() {
    return sass('working/scss/main.scss', { style: 'expanded' })
        .pipe(autoprefixer('last 3 versions'))
        .pipe(gulp.dest(asset_path+'/css'))
        .pipe(browserSync.stream({match: '**/*.css'}))
        .on('finish', function() {
            util.log(util.colors.red('Development: main.css complete'));
        });
});

gulp.task('css:prod', function() {
    return sass('working/scss/main.scss', { style: 'expanded' })
        .pipe(autoprefixer({ browsers: 'last 3 versions' }))
        .pipe(pxtorem())
        .pipe(cssnano())
        .pipe(rev())
        .pipe(gulp.dest(asset_path+'/css'))
        .pipe(rev.manifest(asset_path+'/manifest.json', {
            base: asset_path,
            merge: true
        }))
        .pipe(gulp.dest(asset_path))
        .on('finish', function() {
            util.log(util.colors.red('Production: main.css complete'));
        });
});

gulp.task('js:dev', function() {

    gulp.src(['working/js/app.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));

    gulp.src(['working/js/vendor/*.js', 'working/js/plugins/*.js', 'working/js/app.js']) 
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(asset_path+'/js'))
        .pipe(reload({stream:true}))
        .on('finish', function() {
            util.log(util.colors.red('Development: bundle.js complete'));
        });
});

gulp.task('js:prod', function() {

    gulp.src(['working/js/app.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));

    gulp.src(['working/js/vendor/*.js', 'working/js/plugins/*.js', 'working/js/app.js'])
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(asset_path+'/js'))
        .pipe(rev.manifest(asset_path+'/manifest.json', {
            base: asset_path,
            merge: true
        }))
        .pipe(gulp.dest(asset_path))
        .on('finish', function() {
            util.log(util.colors.yellow('Production: bundle.js complete'));
        });
});

gulp.task('fonts', function() {
    return gulp.src('working/fonts/**/*')
        .pipe(gulp.dest(asset_path+'/fonts'))
        .on('finish', function() {
            util.log(util.colors.blue('Fonts complete'));
        });
});

gulp.task('images', function() {
    return gulp.src(['working/images/**/*'])
        .pipe(imagemin([
            imagemin.svgo({ 
                plugins: [{
                    cleanupIDs: false,
                    removeUselessDefs: false,
                    removeXMLNS: true,
                    removeStyleElement: true,
                    removeEditorsNSData: true,
                    removeComments: true
                }]
            })
        ], { verbose: true }))
        .pipe(gulp.dest(asset_path+'/images'))
        .on('finish', function() {
            util.log(util.colors.green('Images complete'));
        });
});

gulp.task('html:dev', function() {
    return gulp.src(['working/pug/**/*.pug'])
    .pipe(pug({
        locals: {}
    }))
    .pipe(gulp.dest(dist))
    .pipe(reload({stream:true}));
});

gulp.task('html:prod', function() {
    return gulp.src(['working/pug/**/*.pug'])
    .pipe(pug({
        locals: {}
    }))
    .pipe(gulp.dest(dist))
    .pipe(reload({stream:true}));
});

gulp.task('clean', function() {
    return del.sync([dist]);
});

gulp.task('inject:dev', ['css:dev', 'js:dev'], function() {
    var js = gulp.src([asset_path + '/**/*.js'], { read: false });
    var css = gulp.src([asset_path + '/**/*.css'], { read: false });
    return gulp.src(dist+'/index.html')
        .pipe(inject(js, { name: 'bundle', relative: true }))
        .pipe(inject(css, { name: 'main', relative: true }))
        .pipe(gulp.dest(dist))
        .on('finish', function() {
            util.log(util.colors.red('Development: Assets injected'));
        });
});

gulp.task('inject:prod', ['css:prod', 'js:prod'], function() {
    var js = gulp.src([asset_path + '/**/*.js'], { read: false });
    var css = gulp.src([asset_path + '/**/*.css'], { read: false });
    return gulp.src(dist+'/index.html')
        .pipe(inject(js, { name: 'bundle', relative: true }))
        .pipe(inject(css, { name: 'main', relative: true }))
        .pipe(gulp.dest(dist))
        .on('finish', function() {
            util.log(util.colors.red('Production: Assets injected'));
        });
});

gulp.task('default', ['clean', 'html:dev', 'images', 'fonts', 'inject:dev', 'watch', 'browser-sync']);

gulp.task('prod', ['clean', 'html:prod', 'images', 'fonts', 'inject:prod' ]);

gulp.task('watch', function() {

    // Watch .pug files
    gulp.watch('working/pug/**/*.pug', ['html:dev']);

    // Watch .scss files
    gulp.watch('working/scss/**/**/*.scss', ['css:dev']);

    // Watch .js files
    gulp.watch('working/js/**/**/*.js', ['js:dev']);

    // Watch image files
    gulp.watch('working/images/**', ['images']);

    // Watch font files
    gulp.watch('working/fonts/**', ['fonts']);

});