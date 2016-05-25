var log4js = require('log4js');

const PATH = './logs/hali.log';
const PATH_SESSION = './logs/session.log';
const APP = 'hali';
const SESSION = 'session';

var logger = {
	app: log4js.getLogger(APP),
	session: log4js.getLogger('session'),
  genInitial: (chat,message) => {
    //hash,chatId,username,message
    return chat.session + "," + chat.id + "," + chat.name + "," + message;
  },
  genMerge: (session,context) => {
    //hash,chatId,username,message
    return session + ":" + JSON.stringify(context);
  }
}

logger.app.setLevel('INFO'); //TRACE, INFO, WARN, ERROR, FATAL, DEBUG
logger.session.setLevel('INFO');

const configureLogs = (logger, path, app) => {
  
  log4js.loadAppender('file');
  log4js.addAppender(log4js.appenders.file(path), app);

  log4js.configure({
    appenders: [
      { type: 'console' },
      { type: 'file', filename: path, category: app }
    ]
  });
};

configureLogs(logger.app, PATH, APP);
configureLogs(logger.session, PATH_SESSION, SESSION);

module.exports = logger;
