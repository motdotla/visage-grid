# visage-grid

Get an email each day of an acquaintance's face. You guess their name.

## Building Steps

```
touch package.json
```

Set up package.json to look something like this.

```javascript
{
  "name": "visage-grid",
  "version": "0.0.1",
  "engines": {
    "node": "0.10.x",
    "npm": "1.2.x"
  },
  "main": "app.js",
  "description": "Get an email each day of an acquaintance's face. You guess their name.",
  "dependencies": {
    "hapi": "1.8.2"
  }
}
```

For those unfamiliar with package.json it sets up your dependencies and a little extra required project data similarly to pip or bundler.

Particularly, here you should not that we are installing [hapi](http://spumko.github.io/) - a nice little framework for building APIs in node.js.

```
npm install
```

Good job. K, now let's setup app.js to accept an endpoint that we can POST an email to with curl.

```javascript
var port        = parseInt(process.env.PORT) || 3000;
var hapi        = require('hapi');

server          = new hapi.Server(+port, '0.0.0.0', { cors: true });

var emails      = {
  create: {
    handler: function(request) {
      request.reply({
        success: true,
        payload: request.payload
      });
    }
  }
};

server.route({
  method    : 'POST',
  path      : '/emails',
  config    : emails.create
});

server.start();
```

There is a lot going on here, especially if you are unfamiliar with node.js. We are setting up the port, initializing hapi, setting up the hapi server and binding it to the port and localhost. Additionally we are passing the cors: true option to that to allow for cross origin requests. 

Then we are setting up an emails.create handler and replying with a success response. This setup is according to hapis rules for formatting. It expects a handler to process the request, and then the request to reply with some json.

Finally, we are creating a route for that API handler, and adding it to our app. Then we start the server.

Alright. let's try it.

Run your node app and then make a post request to the endpoint.

```
curl -X POST http://locahost:3000/emails -d "email=scott.motte@sendgrid.com"
```

You should get a response like the following.

```
{"success":true,"payload":{"email":"scott.motte@sendgrid.com"}}
```

If you didn't get a similar json response, then check and make sure that the path to /emails is correct and that the server is in fact running at locahost.

Ok, so now we know how to build an API endpoint with node.js, but we aren't doing much with it yet. Let's save all the emails we create to a database. Let's use redis. A Redis Set using [SADD](http://redis.io/commands/sadd) will be specifically what we need.

If you haven't installed Redis, I recommend this tutorial: https://www.digitalocean.com/community/articles/how-to-install-and-use-redis

First add redis to the packages.

```
  "dependencies": {
    "hapi": "1.8.2",
    "redis": "0.8.4"
  }
```

Next add redis in the app.js.

```
...
var redis = require('redis');
...
var db = redis.CreateClient();
...
db.sadd("emails", request.payload.email);
```

Ok, let's try making the api request again. It should insert the value into redis. Make sure you have redis installed and running.

```
curl -X POST http://localhost:3000/emails -d "email=scott.motte@sendgrid.com"
```

Now, you should get a response like this.

```
{"success":true,"email":"scott.motte@sendgrid.com"}
```

That's cool. Now let's check and make sure the email is in the database. Let's add an additional endpoint to show all the emails.

```
  index: {
    handler: function(request) {
      db.smembers("emails", function(err, data) {
        request.reply({
          success: true,
          emails: data
        });    
      });
    }
```

And also the server.route

```
server.route({
  method    : 'GET',
  path      : '/emails',
  config    : emails.index
});
```

Now you are probably getting the hang of creating these endpoints. If you curl that one, you will see a list of emails looking something like this.

```
{"success":true,"emails":["scott@scottmotte.com","scott.MOTTE@sendgrid.com","scott.motte@sendgrid.com"]}
```

The redis smembers takes care of keeping the array unique, but it is case sensitive. I'll leave it to you to fix up the create action to downcase everythingor upcase if that is your fancy.

Okay, now we know they are there. Now let's get some contact info associated with them.

We want to email ourself with this so we are going to create a command line task to do that. Then we will setup a cron job to run that task. 
