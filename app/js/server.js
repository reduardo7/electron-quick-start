'use strict';

const express = require('express');
const appServer = express();

module.exports = function ($cfg, $db, $dir) {

	// Configuración
	appServer.configure(function () {
		// Localización de los ficheros estáticos
		appServer.use(express.static($dir + '/public'));
		// Muestra un log de todos los request en la consola
		appServer.use(express.logger('dev'));
		// Permite cambiar el HTML con el método POST
		appServer.use(express.bodyParser());
		// Simula DELETE y PUT
		appServer.use(express.methodOverride());
	});

	// Rutas de nuestro API
	// GET de todos los TODOs
	appServer.get('/api/todos', function (req, res) {
		$db.find({}, function (err, todos) {
			if (err) {
				res.send(err);
			}
			res.json(todos);
		});
	});

	// POST que crea un TODO y devuelve todos tras la creación
	appServer.post('/api/todos', function (req, res) {
		$db.insert({
			text: req.body.text,
			done: false
		}, function (err, todo) {
			if (err) {
				res.send(err);
			}

			$db.find({}, function (err, todos) {
				if (err) {
					res.send(err);
				}
				res.json(todos);
			});
		});
	});

	// DELETE un TODO específico y devuelve todos tras borrarlo.
	appServer.delete('/api/todos/:todo', function (req, res) {
		$db.remove({
			_id: req.params.todo
		}, {}, function (err, todo) {
			if (err) {
				res.send(err);
			}

			$db.find({}, function (err, todos) {
				if (err) {
					res.send(err);
				}
				res.json(todos);
			});
		});
	});

	// Carga una vista HTML simple donde irá nuestra Single AppServer Page
	// Angular Manejará el Frontend
	appServer.get('*', function (req, res) {
		res.sendfile('./public/index.html');
	});

	// Escucha en el puerto $cfg.server.port y corre el server
	appServer.listen($cfg.server.port, function () {
		console.log('App listening on port ' + $cfg.server.port);
	});
};