'use strict';
const __getcwd = () => process.argv[2] ? process.argv[2] : process.cwd();
const __incwd = (path) => __getcwd() + path;
const __data_folder = 'imgupd_data';
const __site_folder = __data_folder + '/site';

const Downloader = require('./downloader.js');
const config = require('./config.js')(`./${__data_folder}/config.json`);
const socketIo = require('socket.io');
const express = require('express');
const open = require('open');

// Create an express app.
const app = express();
app.use(express.static(__getcwd()));
app.use(express.static(__incwd('/' + __site_folder)));
app.use(express.static(__incwd('/pics')));
app.use(express.static(__incwd('/pics/field')));
app.use(express.static(__incwd('/pics/closeup')));
app.use(express.static(__incwd('/picture')));
app.use(express.static(__incwd('/picture/card')));
app.use(express.static(__incwd('/picture/field')));
app.use(express.static(__incwd('/picture/closeup')));
app.get('/', function (request, response) {
  response.sendFile(__incwd(`/${__site_folder}/index.html`));
});

// Create a server by listening to the port in the config.
const server = app.listen(config.port);
// Create a socket by listening to the created server.
// The second argument was extended by the property 'folder', which
// will be used to figure out where the socket.io.min.js script is located.
const io = socketIo.listen(server, {folder: __incwd('/' + __site_folder)});

console.log(`Server is running on port ${config.port}.`);
console.log('Waiting for connection...');

// Open the browser at localhost with the port in the config.
// With this the user only needs to double click the exe and
// wait until the browser has start (if it wasn't already).
open(`http://127.0.0.1:${config.port}/`);

io.sockets.on('connection', function (socket) {
  console.log(`Established connection with ${socket.handshake.headers.host}`);

  // Create a new download for this connection.
  const downloader = new Downloader({
    delay: config.delay,
    dynamic: config.dynamic,
    debug: config.debug,
    stack: config.stack
  });

  socket.on('download_start', function (options) {
    // The options need to be normalized and parsed.
    const normalizedOptions = downloader.normalizeOptions(options);
    const parsedOptions = downloader.parseOptions(normalizedOptions);

    // Starts the download with the options of the client.
    downloader.download(parsedOptions, (type, data) => socket.emit(type, data));
  });

  const stopDownload = () => downloader.stopDownload();
  socket.on('download_cancel', stopDownload);
  socket.on('disconnect', stopDownload);
});
