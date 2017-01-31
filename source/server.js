'use strict';
const __data_folder = 'imgupd_data';
const __site_folder = __data_folder + '/site';

const Downloader = require('./downloader.js');
const config = require('./config.js')(`./${__data_folder}/config.json`);
const socketIo = require('socket.io');
const express = require('express');
const open = require('open');

// Create an express app.
const app = express();
app.use(express.static('.'));
app.use(express.static('./' + __site_folder));
app.use(express.static('./pics'));
app.use(express.static('./pics/field'));
app.use(express.static('./pics/closeup'));
app.use(express.static('./picture'));
app.use(express.static('./picture/card'));
app.use(express.static('./picture/field'));
app.use(express.static('./picture/closeup'));
app.get('/', function (request, response) {
  response.sendFile(`${process.cwd()}/${__site_folder}/index.html`);
});

// Create a server by listening to the port in the config.
const server = app.listen(config.port);
// Create a socket by listening to the created server.
// The second argument was extended by the property 'folder', which
// will be used to figure out where the socket.io.min.js script is located.
const io = socketIo.listen(server, {folder: __site_folder});

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
    download_stack_size: config.download_stack_size
  });

  // Event handler for an incoming message.
  socket.on('message', function (message) {
    const request = JSON.parse(message);

    // Parse the request by its type.
    switch (request.type) {
      case 'download_start': {
        // The options need to be normalized and parsed.
        const options = downloader.normalizeOptions(request.data.options);
        const parsedOptions = downloader.parseOptions(options);

        // Starts the download with the options of the client.
        downloader.download(parsedOptions, data => socket.send(JSON.stringify(data)));
        break;
      }
      case 'download_cancel': {
        // Request cancelation of download.
        downloader.stopDownload();
        break;
      }
    }
  });
});
