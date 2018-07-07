const gulp = require('gulp');
const ts = require('gulp-typescript');
const jasmine = require('gulp-jasmine');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const { fork } = require('child_process');
var sourcemaps = require('gulp-sourcemaps');
const fs = require('fs');

const logGulp = message => console.log(`[gulp] ${message}`);

let child;

const tsProject = ts.createProject(`${__dirname}/tsconfig.json`);

let FCM_KEY;

try {
	FCM_KEY = fs.readFileSync(`${__dirname}/fcm_key`).toString();
} catch (e) {
	console.log(
		'WARNING: This project requires an fcm_key file in order to send push notifications.'
	);
	console.log('Push notifications will be logged to the console.');
}

const env = Object.assign(
	{
		FCM_KEY
	},
	process.env
);

const run = () =>
	fork(['app.js'], {
		cwd: `${__dirname}/dist/`,
		env: env,
		stdio: [process.stdin, process.stdout, process.stderr, 'ipc']
	});

const crashHandler = () => {
	child = null;
};

gulp.task('run', function() {
	if (child && !child.killed) {
		logGulp('Killing running process...');

		child.removeListener('exit', crashHandler);

		child.on('exit', () => {
			logGulp('Done. Restarting...');
			child = run();
		});

		child.kill('SIGINT');

		return;
	}

	console.log('Starting process...');

	child = run();

	// This removes the process if it crashes
	child.on('exit', crashHandler);
});

gulp.task('build', function() {
	var tsResult = tsProject.src()
		.pipe(sourcemaps.init())
		.pipe(tsProject())

	return tsResult.js.pipe(sourcemaps.write("../dist", {sourceRoot: '../dist'})).pipe(gulp.dest(tsProject.config.compilerOptions.outDir));
});

gulp.task('clean', function() {
	return gulp.src('dist', { read: false }).pipe(clean());
});

gulp.task('test:run', function() {
	return gulp.src('dist/spec/**').pipe(jasmine());
});

gulp.task('watch', ['build-reload'], function() {
	gulp.watch(['src/**/*.ts', 'src/**/*.js'], ['build-reload']);
});

gulp.task('build-reload', function(cb) {
	runSequence('build', 'run', cb);
});

gulp.task('test', [], function(cb) {
	runSequence('build', 'test:run', cb);
});

gulp.task('default', [], function(cb) {
	runSequence('clean', 'build', cb);
});
