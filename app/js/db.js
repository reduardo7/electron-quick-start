'use strict';

// http://blog.modulus.io/nodejs-and-sqlite
// http://zetcode.com/db/sqlite/

require('sjsclass').registerGlobal();

const sqlite3 = require("sqlite3");
const fs = require("fs");
const path = require("path");

module.exports = function ($cfg, $dir) {
    'use strict';

    const file = "./db/database.db";
    const fileExists = fs.existsSync(file);

    if (!fileExists) {
        fs.openSync(file, "w");
    }

    Class('DBConnection', {
        __fluent: true,

        __const: {
            file: file
        },

        __protected: {
            _db: undefined,

            _data: function (params, data, jn) {
                var p, c, x, f, i,
                    qw = '',
                    sql = '';

                if (data) {
                    for (i in data) if (data.hasOwnProperty(i)) {
                        p = i.split(/\s+/);
                        f = p[0];
                        x = '$' + i;
                        if (params.hasOwnProperty(x)) {
                            i = 1;
                            while (params.hasOwnProperty(x + i)) {
                                i++;
                            }
                            x += i;
                        }
                        params[x] = data[f];
                        c = (p.length > 1) ? p[1] : "=";
                        if (qw) qw += jn;
                        qw += "`" + f + "` " + c + " " + x;
                    }

                    if (qw) {
                        sql += " WHERE " + qw;
                    }
                }

                return sql;
            },

            _where: function (params, where) {
                return this._data(params, where, ' AND ');
            }
        },

        __property: {
            db: {
                get: function () { return this._db; }
            },
            fileExists: {
                get: function () { return fileExists; }
            }
        },

        __constructor: function () {
            this._db = new sqlite3.Database(this.file);
        },

        /**
         * Execute queryies.
         *
         * @param {Function} fnQ
         */
        execute: function (fnQ) {
            var db = this._db;
            db.serialize(function () {
                fnQ.apply(this, [db]);
            });
        },

        /**
         * Create table.
         *
         * @param {String} table Table name.
         * @param {Object} definition Table definition.
         *        {
         *              id : { type: 'INTEGER', primary : true, autoincrement: true } // Equals to -> id : { type: 'KEY' } || id : 'key'
         *            , name : { type: 'TEXT' }
         *            , price : { type: 'REAL' | 'DECIMAL' | 'FLOAT' }
         *            , age : { type: 'INTEGER' | 'INT' }
         *            , description : { type: 'BLOB' | 'LONGTEXT', isNull : true }
         *        }
         * @param {Boolean} dropTable (Default: FALSE) Drop table if exists?
         */
        createTable: function (table, definition, dropTable) {
            if (!table) throw new Class.Exception('Invalid param "table" for "createTable" method');
            if (!definition) throw new Class.Exception('Invalid param "definition" for "createTable" method');
            // CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customerId INTEGER, price INT)
            // CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, edad TEXT)
            this.execute(function (db) {
                // Build
                var   x, c, d, t
                    , sql = 'CREATE TABLE IF NOT EXISTS `' + table + '` ('
                    , f   = true;

                for (c in definition) {
                    if (f) {
                        f = false;
                    } else {
                        sql += ',';
                    }
                    sql += ' ' + c;

                    d = definition[c];
                    if (typeof d === 'string') {
                        t = d.toUpperCase();
                        d = { };
                    } else if (d) {
                        t = (d.type || '').toUpperCase();
                    } else {
                        d = { };
                    }

                    if (t === 'KEY') {
                        sql += ' INTEGER PRIMARY KEY AUTOINCREMENT';
                    } else {
                        // type
                        switch (t) {
                            default:
                            case 'TEXT':
                                sql += ' TEXT';
                                break;
                            case 'INTEGER':
                            case 'INT':
                                sql += ' INTEGER';
                                break;
                            case 'REAL':
                            case 'DECIMAL':
                            case 'FLOAT':
                                sql += ' REAL';
                                break;
                            case 'BLOB':
                            case 'LONGTEXT':
                                sql += ' BLOB';
                                break;
                        }
                        // primary
                        if (d.primary)
                            sql += ' PRIMARY KEY';
                        // autoincrement
                        if (d.autoincrement)
                            sql += ' AUTOINCREMENT';
                        // isNull
                        if (d.isNull)
                            sql += ' NULL';
                    }
                }
                sql += ' )';

                // Drop table
                if (dropTable)
                    db.run('DROP TABLE IF EXISTS `' + table + '`');

                // Create table
                db.run(sql);
            });
        },

        /**
         * Drop Table if Exists.
         *
         * @param {String} table Table Name.
         */
        dropTable: function (table) {
            if (!table) throw new Class.Exception('Invalid param "table" for "dropTable" method');
            this.execute(function (db) {
                db.run('DROP TABLE IF EXISTS `' + table + '`');
            });
        },

        run: function (sql, params, fnCallback) {
            if (!sql) throw new Class.Exception('Invalid param "sql" for "run" method');
            if (!fnCallback && (typeof params === 'function')) {
                fnCallback = params;
                params = [];
            } else if (!params) {
                params = [];
            }
            var t = this;
            this.execute(function (db) {
                db.run(sql, params, function(error, row) {
                    if (error) {
                        throw new Class.Exception('Query Execute Error!', error);
                    } else {
                        if (typeof fnCallback === 'function')
                            fnCallback.apply(t, [row]);
                    }
                });
            });
        },

        /**
         * Select Query.
         *
         * @param {String} sql Script SQL to execute.
         *        SELECT * FROM usuarios WHERE username = ? AND password = ?
         * @param {Array} params Parameters.
         *        [ 'user', '123456' ]
         * @param {Function} fnRow Callback for each row.
         *        function(row) {
         *            console.log(row.id + ": " + row.thing);
         *        }
         */
        select: function (sql, params, fnRow) {
            if (!sql) throw new Class.Exception('Invalid param "sql" for "select" method');
            if (!fnRow && (typeof params === 'function')) {
                fnRow = params;
                params = [];
            } else if (!params) {
                params = [];
            }
            var t = this;
            this.execute(function (db) {
                var stmt = db.prepare(sql);

                if (params)
                    stmt.bind.apply(stmt, params);

                stmt.all(function(error, row) {
                    if (error) {
                        throw new Class.Exception('Query Execute Error!', error);
                    } else {
                        if (typeof fnRow === 'function')
                            fnRow.apply(t, [row]);
                    }
                });
            });
        },

        /**
         * Insert.
         *
         * @param {String} table
         * @param {Object} data
         *        { id: 1, name: 'test' }
         */
        insert: function (table, data) {
            if (!table) throw new Class.Exception('Invalid param "table" for "insert" method');
            if (!data) throw new Class.Exception('Invalid param "data" for "insert" method');
            this.execute(function (db) {
                // Prepare
                var   sql = 'INSERT INTO `' + table + '` ('
                    , d   = []
                    , v   = ''
                    , c   = '';
                // Build
                for (var i in data) {
                    if (c) {
                        c += ',';
                        v += ',';
                    }
                    c += i;
                    v += '?';
                    d.push(data[i]);
                }
                sql += c + ') VALUES (' + v + ')';
                // Execute
                var stmt = db.prepare(sql);
                stmt.run.apply(stmt, d);
                stmt.finalize();
            });
        },

        delete: function (table, where, fnCallback) {
            if (!table) throw new Class.Exception('Invalid param "table" for "delete" method');
            var sql = "DELETE FROM `" + table + "`",
                params = {},
                sql, i, qw, x;

            if (!fnCallback && (typeof where === 'function')) {
                fnCallback = where;
                where = {};
            } else if (!where) {
                where = {};
            }

            sql += this._where(params, where);
            this.run(sql, params, fnCallback);
        },

        replace: function (table, data, where, fnCallback) {
            if (!table) throw new Class.Exception('Invalid param "table" for "replace" method');
            if (!data) throw new Class.Exception('Invalid param "data" for "replace" method');
            var sql = "REPLACE `" + table + "` SET ",
                params = {},
                sql, i, qw, x;

            if (!fnCallback && (typeof where === 'function')) {
                fnCallback = where;
                where = {};
            } else if (!where) {
                where = {};
            }

            sql += this._data(params, data, ', ');
            sql += this._where(params, where);
            this.run(sql, params, fnCallback);
        },

        update: function (table, data, where, fnCallback) {
            if (!table) throw new Class.Exception('Invalid param "table" for "update" method');
            if (!data) throw new Class.Exception('Invalid param "data" for "update" method');
            var sql = "UPDATE `" + table + "` SET ",
                params = {},
                sql, i, qw, x;

            if (!fnCallback && (typeof where === 'function')) {
                fnCallback = where;
                where = {};
            } else if (!where) {
                where = {};
            }

            sql += this._data(params, data, ', ');
            sql += this._where(params, where);
            this.run(sql, params, fnCallback);
        },

        /**
         * Close connection.
         */
        close: function () {
            this._db.close();
        }
    });


    // require('./sqlitedb.js');

    // // http://uno-de-piera.com/sqlite3-con-node-js-y-express/
    // // http://uno-de-piera.com/login-con-node-js-y-sqlite3/

    /*
    var $db = new DBConnection();

    $db.execute(function (db) {
        db.createTable('test', {
              id : 'key'
            , name : { type : 'text' }
            , age : { type : 'integer' }
        });

        db.insert('test', { name: 'Mateo 2', age: 0 })
            .insert('test', { name: 'Lucy 2', age: 3 })
            .insert('test', { name: 'Vane 2', age: 25 })
            .insert('test', { name: 'Edu 2', age: 27 });

        db.select('SELECT * FROM test', function (row) {
            console.log(row);
        });
    });
    */

    // Create DB
    $db = new DBConnection();
    const modelsPath = $dir + '/model';

    $db.execute(function (db) {
        var i, fileName, files, fileCont, name;

        files = fs.readdirSync(modelsPath)

        for (i = 0; i < files.length; i++) {
            fileName = files[i];
            if (/.*\.json$/i.test(fileName)) {
                name = fileName.split(/\./)[0];
                db.createTable(fileCont, require(modelsPath + '/' + fileName));
            }
        }
    });

    // Return DB
    return $db;
};