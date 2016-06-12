'use strict';
var assert = require('assert'),
    server = require('../src/server'),
    request = require('request'),
    should = require('should'),
    telegram = require('../src/telegram');

var msg = {
    "message_id":2384,
    "from":
      {
        "id":211613276,
        "first_name":"Martín"
      },
    "chat":{
        "id":211613276,
        "first_name":"Martín",
        "type":"private"
    },
    "date":1465743948,
    "text":"hola"
}

describe('Test stories from Wit.ai', function () {
  /*before(function () {});*/
  this.timeout(8000);
  it('should return an answer', function(done){
    //assert(Array.isArray('a,b,c'.split(',')));
    server.fn_bot(msg)
      .then(function(res){
        assert.equal(res.text, "Hola, que bueno encontrarte por aca. ¿como estás?");
        done();
      })
      .fail(console.log);
      //setTimeout(function(){done();}, 10000);
  });
});
