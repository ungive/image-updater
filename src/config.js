'use strict';
const __getcwd = () => process.argv[2] ? process.argv[2] : process.cwd();

const fs = require('fs');
const path = require('path');
const defaultConfig = {
  port: 3000,
  delay: 500,
  dynamic: true,
  debug: false,
  stack: 10
};

const self = module.exports = function (filePath) {
  const configPath = path.resolve(__getcwd(), filePath);
  let config;

  if (fs.existsSync(configPath)) {
    try {
      // Parse the config file.
      const buffer = fs.readFileSync(configPath);
      config = JSON.parse(buffer);
    }
    catch (e) {
      console.log(`Warning: ${configPath} contains errors.`);
      return defaultConfig;
    }
  }
  else {
    console.log(`Warning: ${configPath} is missing.`);
    return defaultConfig;
  }

  // Validate the config.
  config.port = Number(config.port);
  if (config.port === NaN)      config.port = defaultConfig.port;
  else if (config.port < 1)     config.port = 1;
  else if (config.port > 65535) config.port = 65535;
  else config.port = parseInt(config.port);

  config.delay = Number(config.delay);
  if (config.delay === NaN) config.delay = defaultConfig.delay;
  else config.delay = parseInt(config.delay);

  config.dynamic = !config.hasOwnProperty('dynamic') || !!config.dynamic;
  config.debug = !config.hasOwnProperty('debug') || !!config.debug;

  config.stack = Number(config.stack);
  if (config.stack === NaN)
    config.stack = defaultConfig.stack;
  else config.stack = parseInt(config.stack);

  return config;
};
