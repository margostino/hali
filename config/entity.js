var multiline = require('multiline');

var entity = {
	ABOUT_ME: multiline(function(){/*
Mi nombre es Hali!, la primer asistente de la UTN para personas de la UTN.
HALI proviene de Harry pero dicho por un Oriental. :) jaja.
Fui contruida por el Grupo de Proyecto Final G501 en el año 2016.
Mi mision es ayudarte en tu carrera en todo lo que este a mi alcance.
Para esto seria genial conocernos, y aprender mutuamente.
Cuanto más cuentes conmigo más voy a mejorar y aprender.
Muchas Gracias, y espero que esta relacion sea muy productiva para ambos.
Por cierto venis muy bien en la carrera! Vamos por más. :)

Me encuentro en estado de entrenamiento. En breve ya voy a ser más inteligente! :)
Cuando te recibas vamos a tomar unas cervezas!!!
	*/}),
	NOT_WORKED: multiline(function(){/*
No llego el mensaje. ¿podrías repetirlo?
	*/}),
	API_ERROR: multiline(function(){/*
Ups!, Al parecer tengo un tornillo desajustado y no puedo responder eso.
En breve ya voy a restablecer contacto y así poder ayudarte. Perdón!
	*/}),
	PONG: "Pong!",
	HALI_LANGUAGES: multiline(function(){/*
Entiendo ESPAÑOL y me defiendo con INGLES.
Ojo!, si me haces preguntas en ingles deben ser de los topicos:
Matemática, Estadística y análisis de datos, Química, Física, Astronomía, Ingeniería,
Materiales, Ciencias de la vida (anatomía, plantas, animales, ADN, Genética, etc etc),
Ciencias de la computación.....etc etc....
	*/}),
	HALI_SKILLS: multiline(function(){/*
De momento estoy preparada para lo siguiente:
1) Buscar respuestas en diferentes tópicos en ingles.
(comenzar la pregunta con "w:". Ejemplo: "w: who is Obama?")
2) Traducir texto de español a ingles.
(comenzar la pregunta con "t:". Ejemplo: "t: hola como estas?")
3) Decirte la temperatura actual.
4) Decirte hora y fecha actual.
5) De dominio academico puedo:
	Contarte si el aula Magna esta disponible o no.
	Contarte acerca de mi, mi historia.
	Contarte donde esta tu departamento.
	Contarte libros disponibles.
Y más....!!!!

Dia a dia voy agregando nuevos skills.
Arriba esas palmas!! Clap clap!
	*/}),
	TRANSLATOR_SKILLS: multiline(function(){/*
Por el momento las traducciones son de idioma Español a Ingles.
Para traducir enviame un mensaje taggeado con "t:" como prefijo.
Ejemplos:
> t: ¿Cuales son los algoritmos más eficientes de Inteligencia Artificial?
> t: ¿Cual es el Teorema de Gauss?

	*/}),
	BROADCAST_SKILLS: multiline(function(){/*
Para enviar un mensaje broadcast enviame un mensaje taggeado con "b:" como prefijo.
Ejemplos:
> b: Hola!!, ¿cuando es el parcial de Analisis Matematico II?
> b: Hoy no hay clase, por un inconveniente personal

	*/}),
	TICKET_SKILLS: multiline(function(){/*
Para enviar un ticket de mantenimiento/soporte enviame un mensaje taggeado con "m:" como prefijo.
Ejemplos:
> m: Hola!!, Por favor instalar el Autocad en el Laboratorio Azul, para el Viernes 3.
> m: Hola el baño de hombres del 3er piso esta perdiendo agua

	*/}),
	BROADCAST_CONFUSE: multiline(function(){/*
Me estas confundiendo. Si queres enviar un mensaje a los alumnos, enviame:
Ejemplo:
Mensaje: "la facultad va a estar cerrada hoy"
	*/}),
	CONFUSE: multiline(function(){/*
Me estas confundiendo. Pregunta concreta. ¿En que puedo ayudarte?
	*/}),
	NOT_STORY: multiline(function(){/*
Algunas preguntas o comentarios no los entiendo todavía.
Necesito información adicional para entenderte.
Vuelve a intentar planteando la pregunta de otras formas, quizas comprenda.
	*/}),
	START: multiline(function(){/*
Hola!!!. Necesito que comprobar tu identidad.
Autenticate presionando el comando de abajo porfa :)
	*/}),
	ADVICE: multiline(function(){/*
Si consideras que la respuesta no es correcta, por favor reformula la misma.
Tal vez nombres y apellidos, mas datos del lugar o lo que quieras saber.
Enjoy the knowledge!!! :)
	*/}),
	TESTME: multiline(function(){/*
Hola crack!!, Ya estoy online de nuevo con algo más de entrenamiento.
Cuando tengas tiempo libre testeame.
Y si funciono mal no te quejes que estamos trabajando.
Abrazo.
	*/}),
	ASK_START: multiline(function(){/*
Hola. Aún no estas autenticado.
Por favor identificate presionando el boton de abajo.
	*/}),
	LOCATIONS: multiline(function(){/*
		Medrano 951 (C1179AAQ) C.A.B.A - Tel: (54 11) 4867-7500.
		Campus: Mozart 2300 (C1407IVT) C.A.B.A. - Tel: (54 11) 4867-7500.
	*/}),
	WALPHA_REFORM: multiline(function(){/*
El módulo WAlpha no puede interpretar tu pregunta. Reformula por favor.
Recorda que por el momento este módulo acepta pregunta en Ingles.
Ejemplo pregunta OK: "w: who is the current president of Brazil?".
Ejemplo pregunta OK: "w: how is going MELI Stock?".
Ejemplo pregunta NO-OK: "w: hola como andas, tell me pitagor theorem fiera!".

Intenta lo siguiente:
Usar diferentes frases o notaciones
Ingresa palabras completas en lugar de abreviaciones
Evita mezclar expresiones matematicas con otras notaciones
Verifica tu ortografia
La pregunta hacela en ingles (por el momento...)

Otros tips usando las consultas en ingles:
Las preguntas en ingles se esperan que sean especificas mas que de tópicos generales...
Ejemplo: Ingresa  "2 cups of sugar", y no "nutrition information"
Vos podes solamente tener respuestas acerca de hechos objetivos...
Ejemplo: Intenta "highest mountain", no "most beautiful painting"
Solo conozco lo conocido y real...
Ejemplo: Pregunta "how many men in Mauritania", no "how many monsters in Loch Ness"
Solo información pública tengo disponible
Ejemplo: Pregunta acerca de "GDP of France", no "home phone of Michael Jordan"

Besis.
	*/}),
	WALPHA_SKILLS: multiline(function(){/*
Los tópicos que puedo responder son:
Matemática, Estadística y análisis de datos, Química, Física, Astronomía, Ingeniería,
Materiales, Ciencias de la vida (anatomía, plantas, animales, ADN, Genética, etc etc),
Ciencias de la computación, Gramática y linguistica, Historia y Personajes,
Cultura y Media, Arte y diseño, Musica, Lugares y Geografía, Ciencia de la tierra,
Clima y metereologia, Transporte, Unidad de medidas, Fechas, Calendarios, Feriados, etc.,
Economía y finanzas, Datos socioeconomicos, Salud y medicina, Alimentación y nutrición,
Shopping, Mundo tecnológico, Webs y sistemas computacionales,
Soluciones paso a paso: formulas físicas, química, matemática, teoría de números,
estadística, trigonometría, calculo, ecuaciones diferenciales, etc, etc.,
Educación, Organizaciones, Deportes y juegos.
	*/}),
	GOOGLE_IT: "https://www.google.com.ar/#q=",
	STOP: 'Hasta pronto!'
};

module.exports = entity;
