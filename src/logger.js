var log4js = require('log4js'),
    _ = require('underscore');

const PATH_APP = './logs/app.log';
const PATH_SESSION = './logs/session.log';
const PATH_ERROR = './logs/error.log';
const APP = 'app';
const SESSION = 'session';
const ERROR = 'error';

var log_session = log4js.getLogger(SESSION);
var log_app = log4js.getLogger(APP);
var log_error = log4js.getLogger(ERROR);

log_app.setLevel('INFO'); //TRACE, INFO, WARN, ERROR, FATAL, DEBUG
log_session.setLevel('INFO');
log_session.setLevel('TRACE');
log_error.setLevel('ERROR');

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

configureLogs(log_app, PATH_APP, APP);
configureLogs(log_session, PATH_SESSION, SESSION);
configureLogs(log_error, PATH_ERROR, ERROR);

var logger = {
  app: log_app,
	session: log_session,
  error: log_error,
  genInitial: (chat,message) => {
    return chat.id + "," + chat.name + "," + message;
  },
  genMerge: (session,context) => {
    return session + ":" + JSON.stringify(_.omit(context, '_chat'));
  }
}

module.exports = logger;
