'use strict';
const __getcwd = () => process.argv[2] ? process.argv[2] : process.cwd();

const settings = module.exports = {};

settings.accessToken = 'LZbr-srzU6AAAAAAAAYITK1FXeNg4I7-xyo5nNVc7HxTBfqOSZ8ZIIAfcrSJ8YaT';
settings.dropboxFolders = {
  pics: {
    series9:   '/Series9',
    anime:     '/Anime',
    fullartv1: '/FullArtv1',
    fullartv3: '/FullArtv3',
    rose:      '/Rose',
    vanguard:  '/Vanguard'
  },
  field:   '/field',
  closeup: '/closeup'
};
settings.localFolders = {
  ygopro1: {
    pics: __getcwd() + '/pics',
    field: __getcwd() + '/pics/field',
    closeup: __getcwd() + '/pics/closeup'
  },
  ygopro2: {
    pics: __getcwd() + '/picture/card',
    field: __getcwd() + '/picture/field',
    closeup: __getcwd() + '/picture/closeup'
  }
};
