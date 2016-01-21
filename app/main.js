'use strict';

const $cfg = require('./js/config.json');
//require('sjsclass').registerGlobal();

/** ** **
 *  DB  *
 ** ** **/
/*
const DbEngine = require('tingodb')();
const db = new DbEngine.Db(__dirname + '/db', {});

const Todo = db.model('Todo', {
    text: String
});
*/

require('./js/server.js')($cfg, __dirname);
require('./js/app.js')($cfg, __dirname);
