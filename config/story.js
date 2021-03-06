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
	weather: {
		area: 'Capital Federal, Buenos Aires',
		lang: 'es-ES',
		degreeType: 'C',
		degreeSymbol: '°C'
	},
	list: [
		{
			contexts:[['ping_story', 'dummy'],['ping_story']],
			method:actions.ping_story
		},
		{
			contexts:[['greeting']],
			method:actions.greeting
		},
		{
			contexts: [['greeting_how'],['greeting_how','greeting'],
			['greeting','how','are']],
			method:actions.greeting_how
		},
		{
			contexts: [['how','time'],['what','time'],['what','weather'],['how','weather'],
			['how','weather','when'],['weather'],['how','time','when']],
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
		},
		{
			contexts: [['insulto']],
			method:actions.insulto
		},
		{
			contexts: [['how','years']],
			method:actions.hali_years_old
		},
		{
			contexts: [['what','colour'],['what','colour','are']],
			method:actions.hali_colour
		},
		{
			contexts: [['when','birthday','you']],
			method:actions.hali_birthday
		},
		{
			contexts: [['what','hour'],['what','day'],['what','when','day']],
			method:actions.datetime
		},
		{
			contexts: [['walpha','what','skills'],['help','walpha']],
			method:actions.walpha_skills
		},
		{
			contexts: [['help','translator']],
			method:actions.translator_skills
		},
		{
			contexts: [['help','ticket']],
			method:actions.ticket_skills
		},
		{
			contexts: [['help','broadcast']],
			method:actions.broadcast_skills
		},
		{
			contexts: [['can','what','help'],['can','where','help'],['help'],
			['what','information','know'],['what','information','know'],['help','hali'],
			['what','can','do'],['what','know'],['how','can','help'],['what','do'],
			['what','information','can','ask'],['what','can','do'],['what','can','tell'],
			['what','know'],['what','can','ask'],['what','know','do'],['what','skills']],
			method:actions.hali_skills
		},
		{
			contexts: [['who','are']],
			method:actions.hali_who
		},
		{
			contexts: [['where','are']],
			method:actions.hali_location
		},
		{
			contexts: [['what','can','talk','lang'],['what','know','talk','lang']],
			method:actions.hali_languages
		},
		{
			contexts: [['what','ip'],['what','ip','you'],['what','ip','your']],
			method:actions.hali_arq
		},
		{
			contexts: [['human','are']],
			method:actions.hali_sex
		},
		{
			contexts: [['who','know','iam'],['who','iam']],
			method:actions.who_user
		},
		{
			contexts: [['availability','book','name']],
			method:actions.book_availability
		},
		{
			contexts: [['what','advice','book','subject']],
			method:actions.book_advice
		},
		{
			contexts: [['where','department'],['what','department']],
			method:actions.what_career
		},
		{
			contexts: [['career'],['what','department','career'],
			['where','department','career']],
			method:actions.info_department
		},
		{
			contexts: [['availability','aula','room']],
			method:actions.room_availability
		},
		{
			contexts: [['what','address','sede'],['where','university'],['where','sede'],
		['what','address','university']],
			method:actions.location_university
		},
		{
			contexts: [['phone','sede'],['contact','medrano'],['contact','campus'],
			['contact','university'],['what','phone','sede'],['contact','administration']],
			method:actions.contact_university
		},
		{
			contexts: [['what','calendario'],['calendario'],['calendario','año'],
		['calendario','when']],
			method:actions.calendar
		},
		{
			contexts: [['how','facultad','start'],['how','proceso','ingreso'],
			['how','proceso','beginners']],
			method:actions.beginners_process
		},
		{
			contexts: [['how','mesas','especiales']],
			method:actions.academica_special_exams
		},
		{
			contexts: [['when','next','final_exams']],
			method:actions.when_next_final_exams
		},
		{
			contexts: [['how','exception'],['how','can','correlativas','exception']],
			method:actions.academica_exceptions
		},
		{
			contexts: [['thanks']],
			method:actions.thanks
		}
	]
};

module.exports = stories;
