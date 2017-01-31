'use strict';

// This object contains the settings for the downloader.
const settings = require('./settings.js');
const Dropbox = require('dropbox');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

// Logs an error.
const logError = (error, code) => console.log(`Error(${code}): `, error);

const self = module.exports = function (options) {
  this.delay = options.delay || 500;
  this.downloadStackSize = options.downloadStackSize || 10;

  // Elements indicate if the downloader is currently downloading.
  this.downloading = [];

  // Create a new instance of the Dropbox api.
  this.dropbox = new Dropbox({
    accessToken: settings.accessToken
  });
};

// Normalize the settings that were sent from the client.
self.prototype.normalizeOptions = function (options, override) {
  const normalizedOptions = override ? options : {};

  // Make each property lowercase and remove whitespace.
  for (const element in options) {
    // Copy the element.
    normalizedOptions[element] = options[element];

    // Only normalize strings.
    if (typeof options[element] === 'string') {
      // Remove all characters except alphanumeric ones and underscores.
      normalizedOptions[element] = options[element].replace(/[^a-zA-Z0-9_]+/g, '');
      normalizedOptions[element] = normalizedOptions[element].toLowerCase();
    }
  }

  return normalizedOptions;
};

// Parse options for the download.
self.prototype.parseOptions = function (options) {
  // This array contains all folders that are
  // needed for the download (Dropbox and local).
  const folders = [];
  // The local paths for the specified version of the game.
  const localFolders = settings.localFolders[options.version];

  if (options.type === 'allimages') {
    // Push a folder of each type to the folders array.
    for (const type in settings.dropboxFolders) {
      let dropboxFolder = settings.dropboxFolders[type];
      // If the type is 'pics' get the folder for the specified style.
      if (type === 'pics')
        dropboxFolder = dropboxFolder[options.style];
      // Get the local folder for the specific image type.
      const localFolder = localFolders[type];
      // Push an object that contains the local and the dropbox folder.
      folders.push({
        localFolder: localFolder,
        dropboxFolder: dropboxFolder
      });
    }
  }
  else if (options.type === 'pics') {
    // Get all pics folders by the options' type.
    const picFolders = settings.dropboxFolders[options.type];
    // Get the folder for the wanted style.
    const dropboxFolder = picFolders[options.style];
    // Push an object that contains the local and the dropbox folder.
    folders.push({
      localFolder: localFolders[options.type],
      dropboxFolder: dropboxFolder
    });
  }
  // else if (options.type === 'closeup' && options.version === 'ygopro1')
  //   // Null statement intended to exclude close-ups for YGOPro1.
  //   ;
  else {
    // Get the folder for the wanted type.
    const dropboxFolder = settings.dropboxFolders[options.type];
    // Push an object that contains the local and the dropbox folder.
    folders.push({
      localFolder: localFolders[options.type],
      dropboxFolder: dropboxFolder
    });
  }

  // Return the parsed options.
  return {
    overwrite: options.overwrite,
    folders: folders
  };
};

// This function gathers all files in a dropbox folder.
// The caller has control over each file of the current data bunch,
// and it can decide when it's going to proceed or cancel.
self.prototype.gatherFiles = function (folder, entryCallback, finishedCallback) {
  const self = this;
  // List all files of the folder.
  self.dropbox.filesListFolder({path: folder})
    .then(function _callee_chunk(data) {
      // Save the callee in a variable.
      // It's gonna be used to to continue recursively
      // with the cursor of the current data.
      // const callee = arguments.callee;
      // Recursive function that goes over each file in the current
      // data set and gives control over it back to the caller (entryCallback).
      (function _callee_entry(i, callback) {
        if (i >= data.entries.length)
          return callback();
        // Steps to the next file.
        const next = () => _callee_entry(++i, callback);
        // Gives control over the entry to the caller,
        // which can then invoke 'next' to go on.
        entryCallback(data.entries[i], next);
      })(0, function () {
        // Continue the file listing if there's more data.
        // This is done with a cursor that's part of the current data set.
        if (data.has_more)
          self.dropbox.filesListFolderContinue({cursor: data.cursor})
            // Repeat the process recursively.
            .then(newData => _callee_chunk(newData))
            .catch(error => logError(error, 2));
        else if (typeof finishedCallback === 'function')
          finishedCallback();
      });
    })
    .catch(error => logError(error, 1));
};

// Writes binary data to a destination.
self.prototype.writeFile = function (binary, destination, callback) {
  fs.writeFile(destination, binary, 'binary', function (error) {
    if (error) logError(error, 3);
    if (typeof callback === 'function')
      callback();
  });
};

// Downloads a single file to a destination.
self.prototype.downloadFile = function (filePath, destination, callback) {
  const self = this;
  // Get the data for this file.
  self.dropbox.filesDownload({path: filePath})
    .then(function (data) {
      // Get the directory of the file's destination.
      const directory = path.dirname(destination);
      if (!fs.existsSync(directory))
        // Create the directory if the file does not exist and write the file.
        mkdirp(directory, () => self.writeFile(data.fileBinary, destination, callback));
      else
        // Just write the file.
        self.writeFile(data.fileBinary, destination, callback);
    })
    .catch(error => {
      // When error 'socket hang up' is thrown, retry.
      if (error.message.includes('socket hang up'))
        self.downloadFile(filePath, destination, callback);
      logError(error, 4)
    });
};

// Download all files from Dropbox according to
// the options supplied by the client.
self.prototype.download = function (options, statusCallback) {
  const self = this;

  // Push the downloading status for this download.
  // If it were a single value instead of an array the current
  // download would proceed when another one is started shortly after.
  const inx = self.downloading.length;
  self.downloading.push(true);

  let finished = false;
  // Function that uses the variable 'finished' as flag to
  // make sure that the statusCallback is only invoked once
  // with the type 'finished'.
  const stopDownload = function () {
    if (!finished) {
      finished = true;
      statusCallback({type: 'finished'});
    }
  };
  // Recursive function to go over each
  // folder and its files "synchronously".
  (function _callee_folder(folders, i) {
    if (i >= folders.length) {
      stopDownload();
      self.downloading[inx] = false;
      return;
    }
    // Steps to the next folder.
    const nextFolder = () => _callee_folder(folders, ++i);
    const dropboxFolder = options.folders[i].dropboxFolder.toLowerCase();
    const localFolder = options.folders[i].localFolder;
    // This array will contain all entry of the current folder.
    const allEntries = [];
    // Tracks how many files have been downloaded.
    let downloadedFiles = 0;

    // Invoke the status callback.
    statusCallback({
      type: 'collecting_files',
      content: {type: path.basename(localFolder)}
    });

    // Gather all files and download them.
    self.gatherFiles(dropboxFolder, function (entry, next) {
      // Do not continue if the download was stopped.
      if (!self.downloading[inx]) return stopDownload();
      // Push the relevant data to the array.
      allEntries.push({
        name: entry.name,
        modified: entry.client_modified
      });
      next(); // Continue.
    }, function () {
      const fileCount = allEntries.length;
      // The download stack keeps track on how many downloads are currently processed.
      // A download that would cause it to exceed the limit in the config file
      // (download_stack_size) has to wait until another download has finished.
      let downloadStack = 0;

      // Invoke the status callback.
      statusCallback({
        type: 'file_count',
        content: {file_count: fileCount}
      });

      (function _callee_file() {
        // Do not continue if the download was stopped.
        if (!self.downloading[inx]) return stopDownload();
        if (allEntries.length <= 0)
          return;
        // Moves to the next file.
        const next = () => _callee_file();
        // Splice the current element from the array.
        const entry = allEntries.splice(0, 1)[0];
        // The paths to the file.
        const dropboxFilePath = `${dropboxFolder}/${entry.name}`;
        const destination = `${localFolder}/${entry.name}`;
        const relative = path.relative(process.cwd() + '/site/', destination);

        // Code for downloading is in a seperate function because it's used twice.
        const doDownload = function () {
          // Increment the download stack by 1.
          downloadStack += 1;
          // Download the file to the local folder.
          self.downloadFile(dropboxFilePath, destination, function () {
            // Decrement the download stack by 1.
            downloadStack -= 1;
            ++downloadedFiles;
            // Do not continue if the download was stopped.
            if (!self.downloading[inx]) return stopDownload();
            // Invoke the status callback with information about the current file.
            statusCallback({
              type: 'file',
              content: {
                name: entry.name,
                path: relative,
                number: downloadedFiles
              }
            });
            // Download the next folder if all files of this one were downloaded.
            if (downloadedFiles === fileCount)
              nextFolder();
          });
          if (downloadStack > self.downloadStackSize) {
            // Wait until the download stack is under the limit.
            const interval = setInterval(function () {
              // Also continue when the download was stopped!
              // Otherwise this interval would run forever.
              if (downloadStack <= self.downloadStackSize || !self.downloading[inx]) {
                clearInterval(interval);
                if (self.delay)
                  // Move to the next file with the specified delay.
                  setTimeout(() => next(), self.delay);
                else next(); // Continue.
              }
            }, 10);
          }
          else if (self.delay)
            // Move to the next file with the specified delay.
            setTimeout(() => next(), self.delay);
          else next(); // Continue.
        };

        // Check if the entry is outdated or not if the client wants to update.
        if (!options.overwrite && fs.existsSync(destination))
          fs.stat(destination, function (error, stats) {
            if (error) return logError(error, 5);
            // Get the times of modification.
            const timeModifiedLocal = new Date(stats.mtime);
            const timeModifiedDropbox = new Date(entry.client_modified);
            // Compare the dates of modification of both the local file and
            // the dropbox file and download it if it is outdated.
            const isOutdated = timeModifiedLocal < timeModifiedDropbox;
            if (isOutdated)
              // File is outdated so download it.
              doDownload();
            else {
              // This file is downloaded.
              ++downloadedFiles;
              // Invoke the status callback with
              // information about the skipped file.
              statusCallback({
                type: 'file',
                content: {
                  name: entry.name,
                  path: relative,
                  number: downloadedFiles
                }
              });
              if (downloadedFiles === fileCount)
                // Download the next folder if all
                // files of this one were downloaded.
                nextFolder();
              else
                // Directly move to the next file if
                // this file isn't going to be downloaded.
                next();
            }
          });
        else
          // Move directly to the download.
          doDownload();
      })();
    });
  })(options.folders, 0);
};

// Flags that the download should stop.
// It will be stopped at the earliest
// point in the 'download' function.
self.prototype.stopDownload = function () {
  for (let i = 0; i < this.downloading.length; ++i)
    this.downloading[i] = false;
};
