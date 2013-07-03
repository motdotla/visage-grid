var port        = parseInt(process.env.PORT) || 3000;
var hapi        = require('hapi');
var redis       = require('redis');

var server      = new hapi.Server(+port, '0.0.0.0', { cors: true });
var db          = redis.createClient();

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
