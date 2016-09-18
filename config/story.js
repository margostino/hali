var actions = require('../src/actions')

var stories = {
	contexts: [
		  ['bye'],['greeting'],['greeting','greeting_how'],
		  ['thanks'],['weather'],['where'],['more_info'],['greeting_how'],
		  ['hali_birth'],['hali_name'],['hali_lang'],['get_datetime'],
		  ['hali_skills'],['hali_arq'],['hali_age'],['hali_private'],
		  ['hali_sex'],['hali_color'],['sent_positivo','sent_negativo'],
		  ['who'],['sent_negativo'],['sent_positivo'],['insulto'],
		  ['aula','query_availability'],['search_departamento','where'],
		  ['hali_activity'],['about_it'],['google_it'], ['weather'],
		  ['about_it','hali_activity'],['search_departamento','where','especialidad'],
		  ['start'],['info_final','materia'],['wifi', 'what', 'password'],
			['property', 'what', 'who'],['where','university'],['send','to','message'],
			['book','materia','what'],['book','query_availability', 'book_name'],
			['hali_skills','do'],['alumnos','send','message'],['broadcast'],['ticket'],
			['hali','greeting'],['who_iam'],['find_course','when'],['find_course'],
			['find_course','yes'],['create','ticket','soporte'],['what','day','when'],
			['ping_story']
			//['message_status','broadcast'],['alumnos','say','broadcast'],
	],
	list: [
		{
			contexts:[['ping_story', 'dummy']],
			method:actions.ping_story
		},
		{
			contexts:[['greeting']],
			method:actions.greeting
		},
		{
			contexts: [['greeting_how'],['greeting_how','greeting']],
			method:actions.greeting_how
		},
		{
			contexts: [['how','time'],['what','time'],['what','weather']],
			method:actions.weather
		},
		{
			contexts: [['thanks']],
			method:actions.thanks
		},
		{
			contexts: [['where','aula','course','when'],['where','course','when'],
								['what','course','when']],
			method:actions.info_course
		},
		{
			contexts: [['where','course'],['what','course']],
			method:actions.where_course
		},
		{
			contexts: [['translate']],
			method:actions.translate
		},
		{
			contexts: [['what','password','wifi']],
			method:actions.info_wifi
		},
		{
			contexts: [['bye']],
			method:actions.bye
		}
	],
	tags:['t','b','w','m'],
	weather: {
		area: 'Capital Federal, Buenos Aires',
		lang: 'es-ES',
		degreeType: 'C',
		degreeSymbol: '°C'
	}
};

module.exports = stories;
