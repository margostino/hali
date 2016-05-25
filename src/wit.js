var _ = require('underscore'),	
	app_cfg = require('../config/app'),
	ctx_cfg = require('../config/ctx'),
	entity = require('../config/entity'),
	logger_wit = require('node-wit').Logger;
	levels = require('node-wit').logLevels;
	Wit = require('node-wit').Wit,
	logger = require('./logger'),
	hash = require('object-hash');  

const session = hash(app_cfg.session, app_cfg.hash);
const TOKEN = app_cfg.token_wit;
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

var wit = {	
	session: session,
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
	mergePreContext: (ctx, pre) => {
		var current = JSON.parse(JSON.stringify(ctx));		
	    _.each(_.keys(pre),function(k){
	      if(k!="msg_request")
	        current[k]=pre[k];
	    });
	    return ctx;
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
	    else{	      
	      logger.app.info("Contexto no entrenado: " + JSON.stringify(current));	      
	      ctx = {};
	      ctx['not_story'] = entity.NOT_STORY;
	    }

	  return ctx;
	},			
	runActions: (actions, chatId, message, fn) => {
	  console.log("Ejecuta Wit.ai");	 	  	
	  session = session + chatId;	 
	  client(actions).runActions(session, message, context, (error, context1) => {
	  		fn(error, context1);
	  });
	}	
}

module.exports = wit;

