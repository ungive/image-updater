'use strict';

const settings = module.exports = {};

settings.accessToken = '<ACCESS_TOKEN>';
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
    pics: process.cwd() + '/pics',
    field: process.cwd() + '/pics/field',
    closeup: process.cwd() + '/pics/closeup'
  },
  ygopro2: {
    pics: process.cwd() + '/picture/card',
    field: process.cwd() + '/picture/field',
    closeup: process.cwd() + '/picture/closeup'
  }
};
