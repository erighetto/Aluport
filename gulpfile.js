var domain          = 'aluport';  // Set this to your local development domain.

// Gulp and node.
var gulp            = require('gulp');
var shell           = require('gulp-shell')
var plumber         = require('gulp-plumber');
var watch           = require('gulp-watch');
var gulpFilter      = require('gulp-filter');
var runSequence     = require('run-sequence');
var gutil           = require('gulp-util');
var notify          = require('gulp-notify');

// Basic workflow.
var sass            = require('gulp-sass');
var sourcemaps      = require('gulp-sourcemaps');
var autoprefixer    = require('gulp-autoprefixer');
var browserSync     = require('browser-sync');
var reload          = browserSync.reload;
var bs              = require('browser-sync').create();
var wiredep         = require('wiredep').stream;

// Performance.
var postcss         = require('gulp-postcss');
var imageop         = require('gulp-image-optimization');
var svgmin          = require('gulp-svgmin');

// Error handling.
// Lifted directly from https://github.com/mikaelbr/gulp-notify/issues/81#issuecomment-100422179.
var reportError = function (error) {
    var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

    notify({
        title: 'Task Failed [' + error.plugin + ']',
        message: lineNumber + 'See console.',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);

    gutil.beep(); // Beep 'sosumi' again

    // Inspect the error object
    //console.log(error);

    // Easy error reporting
    //console.log(error.toString());

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.white.bgRed;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    report += chalk('PROB:') + ' ' + error.message + '\n';
    if (error.lineNumber) { report += chalk('LINE:') + ' ' + error.lineNumber + '\n'; }
    if (error.fileName)   { report += chalk('FILE:') + ' ' + error.fileName + '\n'; }
    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
};

// Paths.
var paths = {
    drupalStyle: {
        src:        'sass/',
        dest:       'css/'
    },
    drupalScripts: {
        src:        'js-src',
        dest:       'js/'
    },
    drupalImages: {
        src:        'img-src/',
        dest:       'images/'
    },
    drupalTemplates: {
        dest:       'templates/'
    }
};

// Files with paths.
var files = {
    drupalStyleSrc:     paths.drupalStyle.src + '**/*.scss',
    drupalStyleDest:    paths.drupalStyle.dest + 'style.css',
    drupalScriptsSrc:   paths.drupalScripts.src + '*.js',
    drupalScriptsDest:  paths.drupalScripts.dest + '*.js',
    drupalTemplateDest: paths.drupalTemplates.dest + '**/*.twig',
    imagesSrc:          paths.drupalImages.src + '*.*',
    imagesDest:         paths.drupalImages.dest  + '*.*'
};

// Files to watch.
var watchfiles = [
    files.drupalScriptsSrc,
    files.drupalScriptsDest,
    files.drupalStyleDest,
    files.drupalStyleSrc,
    files.imagesSrc,
    files.imagesDest,
    files.drupalTemplateDest
];

// Fire up Browser Sync.
gulp.task('browser-sync', function() {
    browserSync.init( {
        // Browsersync with a php server.
        proxy: domain,
        notify: true
    });
});

// Drupal theme Sass task.
gulp.task('sass-drupal', function () {
    return gulp.src(files.drupalStyleSrc)
        .pipe(plumber({
            errorHandler: reportError
        }))
        .pipe(wiredep({}))
        .pipe(sass({
            //outputStyle: 'compressed',
            includePaths: ['styles'],
            outputStyle: 'nested',
            precision: 10
        }))
        .on('error', reportError)
        .pipe(gulp.dest(paths.drupalStyle.dest))
        .pipe(gulpFilter(files.drupalStyleDest))
});

gulp.task('rsync-js', function () {
    return gulp.src(mainBowerFiles(/* options */), {base: 'bower_components'})
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(uglify())
        .pipe(concat('scripts.js'), {newLine: ';'})
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('' + paths.drupalScripts.dest + ''));
});

// Autoprefixer.
gulp.task('autoprefixer', function () {
    // Prevent reading sourcemaps to autoprefix them or make sourcemaps of sourcemaps
    var filter = gulpFilter(['*.css', '!*.map']);
    return gulp.src(files.drupalStyleSrc)
        .pipe(plumber({
            errorHandler: reportError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(filter)
        .pipe(autoprefixer({ browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'], cascade: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(filter.restore())
        .on('error', reportError)
        .pipe(gulp.dest(paths.drupalStyle.dest))
});

// Optimize PNG, JPG and GIF images.
gulp.task('optimize-images', function(cb) {
    gulp.src(paths.drupalImages.src + '*.{gif,jpg,jpeg,png}').pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest(paths.drupalImages.dest)).on('end', cb).on('error', cb);
});

// Optimize SVG images.
gulp.task('optimize-images-svg', function(cb) {
    gulp.src(paths.drupalImages.src + '*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest(paths.drupalImages.dest)).on('end', cb).on('error', cb);
});

// Test.
// This doesn't do anything right now, but it gets triggered during commits.
gulp.task('test', function () {
});

// Sass.
gulp.task('run-sass', ['sass-drupal', 'autoprefixer']);

// Use Drush to clear Drupal cache.
gulp.task('clear-cache', shell.task([
    'drush cache-rebuild'
]));

// When Drupal template files are updated we need to clear cache and the refresh the browser.
// We use a command line method of reloading Browser Sync so that we can add a delay before it fires.
// Otherwise, Browser Sync will fire before the cache is cleared.
gulp.task('templates-watch', ['clear-cache'], shell.task([
    'sleep 15s && browser-sync reload'
]));

// Watch file changes and trigger Browser Sync.
gulp.task('reload-bs', ['run-sass'], browserSync.reload);

// The files being watched.
gulp.task('watch-files', ['run-sass'], function () {
    // Make browsers reload after tasks are complete.
    gulp.watch(files.drupalStyleSrc, ['reload-bs']);
    gulp.watch(files.drupalScriptsSrc, ['rsync-js', 'clear-cache']).on('change', browserSync.reload);
    gulp.watch(files.imagesSrc, ['optimize-images', 'optimize-images-svg']).on('change', browserSync.reload);
    gulp.watch(files.drupalTemplateDest, ['templates-watch']);
});

// Run 'gulp build-dev' during development.
gulp.task('build-dev', function (callback) {
    runSequence(
        'run-sass',
        'browser-sync',
        'watch-files',
        callback
    );
});
