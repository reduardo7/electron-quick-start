'use strict';

const Datastore = require('nedb');

module.exports = function ($cfg, $dir) {
	const dbPath = __dirname + '/main.db';
	console.log('DB Path:', dbPath);

	const db = new Datastore({
		filename: dbPath,
		autoload: true
	});

	return db;
};