var dotenv = require('dotenv');
dotenv().load();

var port        = parseInt(process.env.PORT) || 3000;
var hapi        = require('hapi');
var redis       = require('redis');

var server      = new hapi.Server(+port, '0.0.0.0', { cors: true });
var db;
if (process.env.REDISTOGO_URL) {
  var rtg     = require("url").parse(process.env.REDISTOGO_URL);
  var db      = redis.createClient(rtg.port, rtg.hostname);
  db.auth(rtg.auth.split(":")[1]);
} else {
  db          = redis.createClient();
}

var emails      = {
  create: {
    handler: function(request) {
      var payload = request.payload;

      db.sadd("emails", payload.email); 
      
      request.reply({
        success: true,
        email: payload.email 
      });
    }
  },
  index: {
    handler: function(request) {
      db.smembers("emails", function(err, data) {
        request.reply({
          success: true,
          emails: data
        });    
      });
    }
  }
};

server.route({
  method    : 'POST',
  path      : '/emails',
  config    : emails.create
});
server.route({
  method    : 'GET',
  path      : '/emails',
  config    : emails.index
});

server.start();
