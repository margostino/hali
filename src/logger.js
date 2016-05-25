var log4js = require('log4js'),
    _ = require('underscore');  

const PATH = './logs/hali.log';
const PATH_SESSION = './logs/session.log';
const APP = 'hali';
const SESSION = 'session';

var logger = {
	app: log4js.getLogger(APP),
	session: log4js.getLogger('session'),
  genInitial: (chat,message) => {    
    return chat.id + "," + chat.name + "," + message;
  },
  genMerge: (session,context) => {   
    return session + ":" + JSON.stringify(_.omit(context, '_chat'));
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
