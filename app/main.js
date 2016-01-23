'use strict';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const $cfg = require('./js/config.json');
const $db = require('./js/db.js')($cfg, __dirname);

/*
process.stdin.resume();

function exitHandler(options, err) {
	if (options.cleanup) {
		console.log('Close DB');
		$db.close();
	}
	if (err) {
		console.log(err.stack);
	}
	if (options.exit) {
		process.exit();
	}
}

// Do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// Catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
*/

require('./js/server.js')($cfg, $db, __dirname);
require('./js/app.js')($cfg, $db, __dirname);
