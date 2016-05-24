var _ = require('underscore'),	
	app_cfg = require('../config/app'),
	ctx_cfg = require('../config/ctx'),
	entity = require('../config/entity'),
	logger_wit = require('node-wit').Logger;
	levels = require('node-wit').logLevels;
	Wit = require('node-wit').Wit,
	logger = require('./logger');

const TOKEN = app_cfg.token_wit;
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

var wit = {	
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
	mergeEntities: (entities) => {  
	  var context = {};
	  var keys = _.keys(entities);
	  _.each(keys, function(entity){      
	      _.each(entities[entity], function(values){          
	        if (entity=="intent")
	          context[values.value] = values.value;
	        else
	          context[entity] = values.value;          
	      });
	  });
	  return context;  
	},
	validatePreContext: (context) => {
	  if(!matchContext(context))
	    context = {};

	  return context;
	},
	mergePreContext: (current, pre) => {    
	    _.each(_.keys(pre),function(k){
	      if(k!="msg_request")
	        current[k]=pre[k];
	    });
	       
	    return current;
	},
	updateContext: (current, pre) => {
	    var context = {};
	    if(matchContext(pre))
	          context = pre;
	    else if(matchContext(current))
	          context = current;
	    else{	      
	      logger.info("Contexto no entrenado: " + JSON.stringify(current));	      
	      context = {};
	      context['not_story'] = entity.NOT_STORY;
	    }

	  return context;
	},			
	runActions: (chatId, message) => {
	  console.log("Ejecuta Wit.ai");
	  CLIENT.runActions(session_wit, message, context, (error, context1) => {
	        if (error) {
	          console.log('Oops! Got an error: ' + error);          
	          bot.sendMessage(chatId, entity.NOT_STORY);  
	        } else {
	          bot.sendMessage(chatId, response);
	        }
	  });
	}	
}

module.exports = wit;

