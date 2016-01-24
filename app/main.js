'use strict';

require('sjsclass').registerGlobal();

const $cfg = require('./js/config.json');
require('./js/server.js')($cfg, __dirname);
require('./js/app.js')($cfg, __dirname);
