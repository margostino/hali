var datetime = require('node-datetime'),
	random = require("random-js")(); // uses the nativeMath engine

const NAME = 'hali';
const DEV = 'dev';

var app = {
	name: NAME,
	token_tg: '219665776:AAEigXWrsa16CxeVqPWvhOoMolhUm7ADVyI',
	token_wit: 'FZH5RLDHPEIDWZB35ZIL2F4HG3KGNAZN',
	session: {
		app:NAME,
		env:DEV,
		datetime:datetime.create(Date.now()),
	    random:random.integer(1, 9000)
	}
};

module.exports = app;