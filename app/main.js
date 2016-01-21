'use strict';

const electron = require('electron');
const express = require('express');
const appServer = express();
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;




// Config
var $cfg = {
    server: {
        port: 8087
    }
};

// Conexión con la base de datos
//var db = openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024);

// Configuración
appServer.configure(function () {
    // Localización de los ficheros estáticos
    appServer.use(express.static(__dirname + '/public'));
    // Muestra un log de todos los request en la consola
    appServer.use(express.logger('dev'));
    // Permite cambiar el HTML con el método POST
    appServer.use(express.bodyParser());
    // Simula DELETE y PUT
    appServer.use(express.methodOverride());
});

// Rutas de nuestro API
// GET de todos los TODOs
appServer.get('/api/todos', function(req, res) {  
    /*Todo.find(function(err, todos) {
        if(err) {
            res.send(err);
        }
        res.json(todos);
    });*/
});

// POST que crea un TODO y devuelve todos tras la creación
appServer.post('/api/todos', function(req, res) {
    /*Todo.create({
        text: req.body.text,
        done: false
    }, function (err, todo){
        if(err) {
            res.send(err);
        }

        Todo.find (function(err, todos) {
            if(err){
                res.send(err);
            }
            res.json(todos);
        });
    });*/
});

// DELETE un TODO específico y devuelve todos tras borrarlo.
appServer.delete('/api/todos/:todo', function(req, res) {
    /*Todo.remove({
        _id: req.params.todo
    }, function (err, todo) {
        if (err) {
            res.send(err);
        }

        Todo.find(function (err, todos) {
            if (err) {
                res.send(err);
            }
            res.json(todos);
        });

    })*/
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



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('http://127.0.0.1:' + $cfg.server.port);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
