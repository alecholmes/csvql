'use strict';

var gulp = require('gulp');
var del = require('del');

var path = require('path');

// Load plugins
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var sourceFile = './app/scripts/app.js';
var destFolder = './dist/scripts';
var destFileName = 'app.js';

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');

// Styles
gulp.task('styles', ['sass', 'moveCss']);

gulp.task('moveCss', ['clean'], function() {
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  gulp.src(['./app/styles/**/*.css'], { base: './app/styles/' })
  .pipe(gulp.dest('dist/styles'));
});

gulp.task('sass', function() {
  return $.rubySass('./app/styles', {
      style: 'expanded',
      precision: 10,
      loadPath: ['app/bower_components'],
    })
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size());
});

var bundler = watchify(browserify({
  entries: [sourceFile],
  debug: true,
  insertGlobals: true,
  cache: {},
  packageCache: {},
  fullPaths: true,
}));

bundler.on('update', rebundle);
bundler.on('log', $.util.log);

function rebundle() {
  return bundler.bundle()

    // log errors if they happen
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source(destFileName))
    .pipe(gulp.dest(destFolder))
    .on('end', function() {
      reload();
    });
}

// Scripts
gulp.task('scripts', rebundle);

gulp.task('buildScripts', function() {
  return browserify(sourceFile)
    .bundle()
    .pipe(source(destFileName))
    .pipe(gulp.dest('dist/scripts'));
});

// HTML
gulp.task('html', function() {
  return gulp.src('app/*.html')
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

// Images
gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

// Fonts
gulp.task('fonts', function() {
  return gulp.src(require('main-bower-files')({
      filter: '**/*.{eot,svg,ttf,woff,woff2}',
    }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('dist/fonts'));
});

// Clean
gulp.task('clean', function(cb) {
  $.cache.clearAll();
  cb(del.sync(['dist/styles', 'dist/scripts', 'dist/images']));
});

// Bundle
gulp.task('bundle', ['styles', 'scripts', 'bower'], function() {
  return gulp.src('./app/*.html')
    .pipe($.useref.assets())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('buildBundle', ['styles', 'buildScripts', 'moveLibraries', 'bower'], function() {
  return gulp.src('./app/*.html')
    .pipe($.useref.assets())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

// Move JS Files and Libraries
gulp.task('moveLibraries', ['clean'], function() {
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  gulp.src(['./app/scripts/**/*.js'], { base: './app/scripts/' })
  .pipe(gulp.dest('dist/scripts'));
});

// Bower helper
gulp.task('bower', function() {
  gulp.src('app/bower_components/**/*.js', {
      base: 'app/bower_components',
    })
    .pipe(gulp.dest('dist/bower_components/'));

});

gulp.task('json', function() {
  gulp.src('app/scripts/json/**/*.json', {
      base: 'app/scripts',
    })
    .pipe(gulp.dest('dist/scripts/'));
});

// Robots.txt and favicon.ico
gulp.task('extras', function() {
  return gulp.src(['app/*.txt', 'app/*.ico'])
    .pipe(gulp.dest('dist/'))
    .pipe($.size());
});

// Watch
gulp.task('watch', ['html', 'fonts', 'bundle'], function() {

  browserSync({
    notify: false,
    logPrefix: 'BS',

    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //     will present a certificate warning in the browser.
    // https: true,
    server: ['dist', 'app'],
  });

  // Watch .json files
  gulp.watch('app/scripts/**/*.json', ['json']);

  // Watch .html files
  gulp.watch('app/*.html', ['html']);

  gulp.watch(['app/styles/**/*.scss', 'app/styles/**/*.css'], ['styles', 'scripts', reload]);

  // Watch image files
  gulp.watch('app/images/**/*', reload);
});

// Lint
gulp.task('lint', function() {
  return gulp.src(['app/scripts/**/*.js'])

    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe(eslint({
      baseConfig: {
        ecmaFeatures: {
          jsx: true,
        },
        extends: [
          'eslint:recommended',
        ],
      },
      envs: [
        'browser',
        'jest',
        'node',
      ],
      plugins: [
        'react',
      ],
      rules: {
        'comma-dangle': 0,

        // 'jsx-quotes': 1,

        // 'react/display-name': 1,
        'react/jsx-boolean-value': 1,
        'react/jsx-curly-spacing': 1,
        'react/jsx-max-props-per-line': 1,
        'react/jsx-no-duplicate-props': 1,
        'react/jsx-no-undef': 1,
        'react/jsx-sort-prop-types': 1,
        'react/jsx-sort-props': 1,
        'react/jsx-uses-react': 1,
        'react/jsx-uses-vars': 1,
        'react/no-danger': 1,
        'react/no-did-mount-set-state': 1,
        'react/no-did-update-set-state': 1,
        'react/no-multi-comp': 1,
        'react/no-unknown-property': 1,

        // 'react/prop-types': 1,
        'react/react-in-jsx-scope': 1,
        'react/require-extension': 1,
        'react/self-closing-comp': 1,
        'react/sort-comp': 1,
        'react/wrap-multilines': 1,
      },
    }))

    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())

    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe(eslint.failOnError());
});

// This doesn't work yet. For now: jscs --fix app/scripts/**/*.js
// gulp.task('autoformat', function () {
//   return gulp.src(['app/scripts/**/*.js'])
//     .pipe(jscs({fix: true}))
//     .pipe(gulp.dest('src'));
// });

// Build
gulp.task('build', ['html', 'buildBundle', 'images', 'fonts', 'extras'], function() {
  gulp.src('dist/scripts/app.js')
    .pipe($.uglify())
    .pipe($.stripDebug())
    .pipe(gulp.dest('dist/scripts'));
});

// Default task
// TODO: add jest after build
gulp.task('default', ['clean', 'lint', 'build']);
