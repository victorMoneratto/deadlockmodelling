'use strict';

var gulp       = require('gulp'),

    jshint     = require('gulp-jshint'),
    connect    = require('gulp-connect'),
    uglify     = require('gulp-uglify'),
    sass       = require('gulp-ruby-sass'),
    prefix     = require('gulp-autoprefixer'),
    jade       = require('gulp-jade'),
    gulpif     = require('gulp-if'),
    stylish    = require('jshint-stylish'),
    del        = require('del'),
    filter     = require('gulp-filter'),
    sequence   = require('gulp-sequence'),
    browserify = require('browserify'),
    debowerify = require('debowerify'),
    gutil      = require('gulp-util'),
    source     = require('vinyl-source-stream'),
    buffer     = require('vinyl-buffer'),
    plumber    = require('gulp-plumber'),
    merge      = require('merge-stream'),
    combiner   = require('stream-combiner2');


//Probably will use these in the future
//var sourcemaps = require('gulp-sourcemaps'),
//    imagemin   = require('gulp-imagemin'),
//    csslint    = require('gulp-csslint'),
//    jshint     = require('gulp-jshint'),
//    pngcrush   = require('imagemin-pngcrush');


var config = {
    src: 'src',
    env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    lib: 'lib/',
    port: 1881
};
config.build = 'build/' + config.env;

gulp.task('jade', function () {
    return gulp.src(config.src + '/**/*.jade')
        .pipe(plumber())
        .pipe(jade())
        .pipe(gulp.dest(config.build))
        .pipe(connect.reload());
});

gulp.task('js', function () {
    //TODO: jshint

    var b = browserify({entries: config.src + '/scripts/app.js', debug: true});
    b.transform(debowerify);
    return merge(
            b.bundle()
                .on('error', function (err) {
                    gutil.log(err.message);
                    this.emit('end');
                })
                .pipe(source('app.js'))
                .pipe(buffer())
                .pipe(gulpif(config.env === 'production', uglify()))
                .pipe(gulp.dest(config.build + '/scripts/')),

            gulp.src(config.lib + '/l20n/dist/compat/web/*.js')
                .pipe(gulp.dest(config.build + '/scripts')))
        .pipe(connect.reload());
});

gulp.task('sass', function () {
    var taskConfig = {};
    if (config.env === 'production') {
        taskConfig.sass = {style: 'compressed'};
    } else {
        taskConfig.sass = {};
    }

    return gulp.src(config.src + '/styles/app.sass')
        .pipe(plumber())
        .pipe(sass({
            style: 'compressed', loadPath: [
                'lib/bootstrap-sass-official/assets/stylesheets'
            ]
        }))
        .pipe(prefix('last 2 version'))
        .pipe(gulp.dest(config.build + '/styles/'))
        .pipe(connect.reload());
});

gulp.task('assets', function () {
    return merge(gulp.src('lib/bootstrap-sass-official/assets/fonts/**/*')
            .pipe(gulp.dest(config.build + '/assets/fonts/')),

        gulp.src(config.src + '/assets/**/*')
            .pipe(gulp.dest(config.build + "/assets"))
    );
});

gulp.task('watch', function () {
    gulp.watch([config.src + '/scripts/**/*.js'], ['js']);
    gulp.watch([config.src + '/**/*.jade'], ['jade']);
    gulp.watch([config.src + '/styles/**/*.s*ss'], ['sass']);
    gulp.watch([config.src + '/assets/**/*'], ['assets']);
});

gulp.task('connect', function () {
    connect.server({
        root: config.build,
        port: config.port,
        livereload: true
    });
});

gulp.task('clean', function () {
    return del(config.build);
});

gulp.task('build', ['js', 'jade', 'sass', 'assets']);
gulp.task('default', sequence('build', ['connect', 'watch']));