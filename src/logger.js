var log4js = require('log4js');

const PATH = './logs/hali.log';
const APP = 'hali';
var logger = log4js.getLogger('hali');
logger.setLevel('INFO'); //TRACE, INFO, WARN, ERROR, FATAL, DEBUG

const configureLogs = (logger) => {
  
  log4js.loadAppender('file');
  log4js.addAppender(log4js.appenders.file(PATH), APP);

  log4js.configure({
    appenders: [
      { type: 'console' },
      { type: 'file', filename: PATH, category: APP }
    ]
  });
};

configureLogs(logger);

module.exports = logger;
