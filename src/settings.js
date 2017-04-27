'use strict';
const __getcwd = () => process.argv[2] ? process.argv[2] : process.cwd();

const settings = module.exports = {};

settings.useRawGit = false;
settings.githubRepositories = {
  pics: {
    series10:   'YGOSeries10CardPics',
    anime:     'YGOAnimeStylePics',
    fullartv1: 'YGOFullArt1Pics',
    fullartv3: 'YGOFullArt3Pics',
    rose:      'YGORoseStylePics',
    vanguard:  'YGOVanguardStylePics'
  },
  field:   'field544x544png',
  closeup: 'YGOTCGOCGPicsNoBG'
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
