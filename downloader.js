'use strict';
const __getcwd = () => process.argv[2] ? process.argv[2] : process.cwd();

// This object contains the settings for the downloader.
const settings = require('./settings.js');
const request = require('request');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

// Logs an error.
const logError = (error, code) => console.log(`Error(${code}): `, error);

const self = module.exports = function (options) {
  this.delay = options.delay || 500;
  this.dynamic = !options.hasOwnProperty('dynamic') || !!options.dynamic;
  this.debug = !options.hasOwnProperty('debug') || !!options.debug;
  this.stack = options.stack || 10;
  this.cardDatabaseFile = options.cardDatabaseFile || './cards.cdb';

  // Elements indicate if the downloader is currently downloading.
  this.downloading = [];
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
    for (const type in settings.githubRepositories) {
      let githubRepository = settings.githubRepositories[type];
      // If the type is 'pics' get the folder for the specified style.
      if (type === 'pics')
        githubRepository = githubRepository[options.style];
      // Get the local folder for the specific image type.
      const localFolder = localFolders[type];
      // Push an object that contains the local and the dropbox folder.
      folders.push({
        localFolder: localFolder,
        githubRepository: githubRepository
      });
    }
  }
  else if (options.type === 'pics') {
    // Get all pics folders by the options' type.
    const picFolders = settings.githubRepositories[options.type];
    // Get the folder for the wanted style.
    const githubRepository = picFolders[options.style];
    // Push an object that contains the local and the dropbox folder.
    folders.push({
      localFolder: localFolders[options.type],
      githubRepository: githubRepository
    });
  }
  // else if (options.type === 'closeup' && options.version === 'ygopro1')
  //   // Null statement intended to exclude close-ups for YGOPro1.
  //   ;
  else {
    // Get the folder for the wanted type.
    const githubRepository = settings.githubRepositories[options.type];
    // Push an object that contains the local and the dropbox folder.
    folders.push({
      localFolder: localFolders[options.type],
      githubRepository: githubRepository
    });
  }

  // Return the parsed options.
  return {
    overwrite: options.overwrite,
    folders: folders
  };
};

function Timer(delay) {
  this.time = 0;
  this.delay = delay || 10;
  const interval = setInterval(() => this.time += this.delay, this.delay);
  this.end = function () {
    clearInterval(interval);
    return this.time;
  };
}

self.prototype.downloadFile = function (repository, file, destination, callback) {
  const timer = new Timer();
  const doDownload = function () {
    let host = settings.useRawGit ? "cdn.rawgit.com" : "raw.githubusercontent.com";
    const url = `https://${host}/shadowfox87/${repository}/master/${file}`;
    const writeStream = fs.createWriteStream(destination);
    writeStream.on('error', error => logError(error, 4));

    let exists = true;
    let size = 0;
    request
      .get(url)
      .on('error', error => logError(error, 2))
      .on('response', response => {
        exists = response.statusCode === 200;
        size = parseInt(response.headers['content-length']);
      })
      .on('end', () => callback({
        exists: exists,
        time: timer.end(),
        size: size
      }))
      .pipe(writeStream);
  };

  // Get the directory of the file's destination.
  const directory = path.dirname(destination);
  if (!fs.existsSync(directory))
    // Create the directory if the file does not exist and download the file.
    mkdirp(directory, doDownload);
  else
    // Directory exists, so go for the download.
    doDownload();
};

// Gets all entries in the update_log.json file of the requested repository.
const getUpdateLog = function (repository, callback) {
  const host = settings.useRawGit ? "cdn.rawgit.com" : "raw.githubusercontent.com";
  const url = `https://${host}/shadowfox87/${repository}/master/update_log.json`;
  request(url, function (error, response, body) {
    if (error) return logError(error, 3);
    if (response.statusCode !== 200) return logError(response, 5);
    // Parse the update log.
    const updateLog = JSON.parse(body);
    // The logEntries array will be a dictionary that can be indexed
    // with a file name to retrieve the date of its last update.
    const logEntries = {};
    for (let i = 0; i < updateLog.length; ++i) {
      const date = new Date(updateLog[i].date);
      for (let j = 0; j < updateLog[i].files.length; ++j) {
        const file = updateLog[i].files[j];
        // Only add/overwrite the file's date if it
        // wasn't added yet or, if it was, the date is newer.
        if (!logEntries.hasOwnProperty(file) || date > logEntries[file])
          logEntries[file] = date;
      }
    }
    callback(logEntries);
  })
};

// Download all files from GitHub according to
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
  const finishDownload = function () {
    if (!finished) {
      finished = true;
      statusCallback('finishing');
    }
  };

  // Recursive function to go over each folder and its files.
  (function _callee_folder(i) {
    if (i >= options.folders.length) {
      finishDownload();
      statusCallback('finished');
      self.downloading[inx] = false;
      return;
    }
    // Steps to the next folder.
    const nextFolder = () => process.nextTick(() => _callee_folder(++i));
    const localFolder = options.folders[i].localFolder;
    const repository = options.folders[i].githubRepository;
    // Tracks how many files have been downloaded.
    let downloadedFiles = 0;

    // Invoke the status callback.
    statusCallback('collecting_files', {type: path.basename(localFolder)});

    let tracker = 0;
    let changeRate = 0;
    let sumTime = 0;
    let lastTime = 0;

    // Get the files of the update log of this download.
    getUpdateLog(repository, function (logEntries) {
      // The download stack keeps track on how many downloads are currently processed.
      // A download that would cause it to exceed the limit in the config file
      // (download_stack_size) has to wait until another download has finished.
      let downloadStack = 0;

      // Contains all files.
      const files = Object.keys(logEntries);

      // Invoke the status callback with the amount of files.
      statusCallback('file_count', {file_count: files.length});

      if (!self.downloading[inx]) {
        finishDownload();
        return statusCallback('finished');
      }

      // Loop to go over each file.
      (function nextFile(i) {
        // Do not continue if the download was stopped.
        if (!self.downloading[inx]) return finishDownload();
        if (i >= files.length) return;
        // Proceeds with the next file, if called.
        const next = () => process.nextTick(() => nextFile(i + 1));

        const file = files[i];
        const date = logEntries[files[i]];
        // The absolute path to the file.
        const destination = path.resolve(localFolder, file);

        // The paths to the file.
        const relative = path.relative(__getcwd() + '/site/', destination);

        // Code for downloading is in a seperate function because it's used twice.
        const doDownload = function () {
          // Increment the download stack by 1.
          downloadStack += 1;
          // Download the file to the local folder.
          self.downloadFile(repository, file, destination, function (result) {
            // Decrement the download stack by 1.
            downloadStack -= 1;
            ++downloadedFiles;

            ++tracker; // Tracker keeps track of the total amount of files that were downloaded.
            // Convert the time to seconds (to lower the chances of overflow)
            // and add it to the total amount of time.
            sumTime += result.time / 1000;

            if (self.dynamic) {
              // Calculate the new delay and split it by the download stack size.
              self.delay = sumTime / tracker * 1000 / self.stack;

              // Get the difference between the new and the old time.
              const difference = result.time - lastTime;
              lastTime = result.time;
              // The change rate keeps track of how the delay behaves over time.
              changeRate += difference / 1000;

              if (changeRate > 3) {
                // Decrement the download stack size if the download gets slower.
                --self.stack;
                changeRate = 0;
              } else if (changeRate < -5) {
                // Increment the download stack size if the download speeds up.
                ++self.stack;
                changeRate = 0;
              }
            }

            if (self.debug) {
              let a = 'average time: ' + (sumTime / tracker).toFixed(1); a += ' '.repeat(20 - a.length) + ' ';
              let b = 'delay: ' + self.delay.toFixed(1);                 b += ' '.repeat(16 - b.length) + ' ';
              let c = 'stack: ' + self.stack;                            c += ' '.repeat(10 - c.length);
              console.log(a + b + c + ' change: ' + changeRate);
            }

            // Invoke the status callback with information about the current file.
            if (result.exists)
              statusCallback('file', {
                name: file,
                path: relative,
                number: downloadedFiles,
                finishing: !self.downloading[inx]
              });
            // Do not continue if the download was stopped.
            if (!self.downloading[inx]) {
              if (downloadStack === 0)
                return statusCallback('finished');
              return finishDownload();
            }
            // Download the next folder if all files of this one were downloaded.
            if (downloadedFiles === files.length)
              nextFolder();
          });
          if (downloadStack > self.stack) {
            // Wait until the download stack is under the limit.
            const interval = setInterval(function () {
              // Also continue when the download was stopped!
              // Otherwise this interval would run forever.
              if (downloadStack <= self.stack || !self.downloading[inx]) {
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

        // Check if the entry is outdated or not, if the client wants to update.
        if (!options.overwrite && fs.existsSync(destination)) {
          fs.stat(destination, function (error, stats) {
            if (error) return logError(error, 1);
            // Get the date of the last modification.
            const dateModified = new Date(stats.mtime);
            // Compare the dates of modification of both the local file and
            // the dropbox file and download it if it is outdated.
            const isOutdated = dateModified < date;
            if (isOutdated)
              // File is outdated so download it.
              doDownload();
            else {
              ++downloadedFiles;
              if (downloadedFiles === files.length)
                // Download the next folder if all
                // files of this one were downloaded.
                nextFolder();
              else
                // Directly move to the next file if
                // this file isn't going to be downloaded.
                next();
            }
          });
        }
        else
          // Move directly to the download.
          doDownload();
      })(0);
    });
  })(0);
};

// Flags that the download should stop.
// It will be stopped at the earliest
// point in the 'download' function.
self.prototype.stopDownload = function () {
  for (let i = 0; i < this.downloading.length; ++i)
    this.downloading[i] = false;
};
