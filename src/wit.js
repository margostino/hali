var _ = require('underscore'),
	app_cfg = require('../config/app'),
	entity = require('../config/entity'),
	story_cfg = require('../config/story'),
	logger_wit = require('node-wit').Logger;
	levels = require('node-wit').logLevels;
	Wit = require('node-wit').Wit,
	logger = require('./logger'),
	hash = require('object-hash');

const session = hash(app_cfg.session, app_cfg.hash);
//const TOKEN = app_cfg.token_wit;
const TOKEN = app_cfg.token_wit_test;
const context = {};
const client = (actions) =>{
		return new Wit(TOKEN, actions)
};

const matchContext = (context) => {
	  var current = _.without(_.keys(context), 'msg_request');
	  var hit = false;
	  _.each(ctx_cfg.contexts, function(c){
		    var diff = _.difference(current, c);
		    if (current.length==c.length && _.isEmpty(diff)){
		      hit = true;
		      return;
		    }
	  });

	  return hit;
};

const matchConfuse = (context) => {
	  var current = _.without(_.keys(context), 'msg_request');
	  var hit = false;
	  _.each(current, function(e){
			_.each(ctx_cfg.contexts, function(c){
			  var diff = _.difference([e], c);
			    if (current.length==c.length && _.isEmpty(diff)){
			      hit = true;
			      return;
			    }
		  });
		});
	  return hit;
};

const matchBroadcastConfuse = (context) => {
	  var current = _.without(_.keys(context), 'msg_request');
		var say = _.contains(current, "say");
		var alumnos = _.contains(current, "alumnos");

		if (say&&alumnos)
			return true;

	  return false;
};

const matchBroadcast = (context) => {
	  var current = _.without(_.keys(context), 'msg_request');
		if (_.contains(current, "broadcast"))
			return true;

	  return false;
};

const matchTicket = (context) => {
	  var current = _.without(_.keys(context), 'msg_request');
		if (_.contains(current, "ticket"))
			return true;

	  return false;
};

const getNotStory = (context) => {
	logger.app.info("Contexto no entrenado: " + JSON.stringify(context));
	var ctx = {};
	ctx['not_story'] = entity.NOT_STORY;
	return ctx;
};

const getConfuse = (context) => {
	logger.app.info("Contexto confuso: " + JSON.stringify(context));
	var ctx = {};
	ctx['confuse'] = entity.CONFUSE;
	return ctx;
};

const getBroadcastConfuse = (context) => {
	logger.app.info("Contexto broadcast confuso: " + JSON.stringify(context));
	var ctx = {};
	ctx['broadcast_confuse'] = entity.BROADCAST_CONFUSE;
	return ctx;
};

const getBroadcast = (context) => {
	logger.app.info("Contexto broadcast: " + JSON.stringify(context));
	var ctx = {};
	ctx['broadcast'] = "broadcast";
	return ctx;
};

const getTicket = (context) => {
	logger.app.info("Contexto ticket: " + JSON.stringify(context));
	var ctx = {};
	ctx['ticket'] = "ticket";
	return ctx;
};

var wit = {
	session: session,
	restart: (id, actions) => {
		client = new Wit(TOKEN, actions);
		wit.session = hash(id, app_cfg.hash);
		console.log("Renew Wit Session: " + wit.session);
	},
	logger: new logger_wit(levels.DEBUG),
	interactive: (actions) => {
		client(actions).interactive();
	},
  	getWeather: (ss) => {
      console.log(ss);
    },
	getIntentValue: (entities, value) => {
	  val = null;
	  if (entities && entities["intent"] &&
	      Array.isArray(entities["intent"]) &&
	      entities["intent"].length > 0){

	    var intent = _.findWhere(entities["intent"], {value:value});
	    if (!_.isUndefined(intent))
	      val = intent.value;
	  }

	  return val;
	},
	//Merge de entidades y contexto actual.
	mergeEntities: (entities) => {
	  var ctx = {};
	  var keys = _.keys(entities);
	  _.each(keys, function(entity){
	      _.each(entities[entity], function(values){
	        if (entity=="intent")
	          ctx[values.value] = values.value;
	        else
	          ctx[entity] = values.value;
	      });
	  });
	  return ctx;
	},
	//Validar pre-contexto con contextos posibles.
	validatePreContext: (context) => {
	  if(!matchContext(context))
	    context = {};

	  return context;
	},
	//Merge pre-contexto con el contexto actual.
	//El objetivo es continuar flujos de las historias si hay match
	mergePreContext: (ctx, pre) => {
		var current = JSON.parse(JSON.stringify(ctx));
	    _.each(_.keys(pre),function(k){
	      if(k!="msg_request")
	        current[k]=pre[k];
	    });

	    return current;
	},
	/* Actualizar contexto según match.
       Si contexto previo merge con actual match OK, entonces toma ese. Si no verifica match el actual.
       Caso negativo es un contexto no entrenado
    */
	updateContext: (current, pre) => {
	    var ctx = {};
	    if(matchContext(pre))
	      ctx = pre;
	    else if(matchContext(current))
	      ctx = current;
			else if(matchBroadcast(current))
				ctx = getBroadcast(current);
			else if(matchTicket(current))
				ctx = getTicket(current);
			/*else if(matchBroadcastConfuse(current))
				ctx = getBroadcastConfuse(current);*/
			else if(matchConfuse(current))
				ctx = getConfuse(current);
	    else
	      ctx = getNotStory(current);

	  return ctx;
	},
	isStart: (context) => {
			return ("start" in context)? true:false;
	},
	matchStory: (current) => {
		current = _.uniq(current);
	  return _.find(story_cfg.list, function(story){
	    return _.find(story.contexts, function(context){
	      var diff = _.difference(current, context);
	      var len_current = current.length;
	      var len_config = context.length;
	      return (len_current==len_config && _.isEmpty(diff))? true:false;
	    });
	  });
	},
	runActions: (actions, chatId, username, message, fn) => {
    //session = session + chatId;
	  console.log("Ejecuta Wit.ai");
	  console.log('Wit User Session: ' + wit.session);

		context.chatId = chatId;
		context.username = username;
		/*var msg_data = {
			id: chatId,
			username: username,
			message: message
		};*/		
	  client(actions).runActions(wit.session, message, context, (error, context1) => {
	  		fn(error, context1);
	  });
	}
}

module.exports = wit;
