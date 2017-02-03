'use strict';
const __getcwd = () => process.argv[2] ? process.argv[2] : process.cwd();

const fs = require('fs');
const path = require('path');
const defaultConfig = {
  port: 3000,
  delay: 500,
  download_stack_size: 10
};

const self = module.exports = function (filePath) {
  const configPath = path.resolve(__getcwd(), filePath);
  let config;

  if (fs.existsSync(configPath)) {
    try {
      // Parse the config file.
      const buffer = fs.readFileSync(configPath);
      config = JSON.parse(buffer);

      // Validate the config.
      config.port = Number(config.port);
      if (config.port === NaN)      config.port = defaultConfig.port;
      else if (config.port < 1)     config.port = 1;
      else if (config.port > 65535) config.port = 65535;
      else config.port = parseInt(config.port);

      config.delay = Number(config.delay);
      if (config.delay === NaN) config.delay = defaultConfig.delay;
      else config.delay = parseInt(config.delay);

      config.download_stack_size = Number(config.download_stack_size);
      if (config.download_stack_size === NaN)
        config.download_stack_size = defaultConfig.download_stack_size;
      else config.download_stack_size = parseInt(config.download_stack_size);

      // config.data_folder = fs.existsSync(config.data_folder) ?
      //   config.data_folder : defaultConfig.config.data_folder;
    }
    catch (e) {
      console.log(`Warning: ${configPath} contains errors.`);
      config = defaultConfig;
    }
  }
  else {
    console.log(`Warning: ${configPath} is missing.`);
    config = defaultConfig;
  }

  return config;
};
