#!/usr/bin/env node

var dotenv = require('dotenv');
dotenv().load();

var to                  = process.env.TO;
var sendgrid_username   = process.env.SENDGRID_USERNAME; 
var sendgrid_password   = process.env.SENDGRID_PASSWORD; 
var fullcontact_key     = process.env.FULLCONTACT_KEY;

var sendgrid            = require('sendgrid')(sendgrid_username, sendgrid_password);
var fullcontact         = require('fullcontact-api')(fullcontact_key);
var redis               = require('redis');
var db;
if (process.env.REDISTOGO_URL) {
  var rtg     = require("url").parse(process.env.REDISTOGO_URL);
  var db      = redis.createClient(rtg.port, rtg.hostname);
  db.auth(rtg.auth.split(":")[1]);
} else {
  db          = redis.createClient();
}

db.smembers("emails", function(err, data) {
  var available_emails  = data;
  var random_number     = Math.floor(Math.random()*available_emails.length);
  var email             = available_emails[random_number];
  
  fullcontact.person.findByEmail(email, function(err, json) {
    if (err) {
      console.log(err);
      process.exit();
    } else {
      var photo_url = json.photos[0].url; 
      var name      = json.contactInfo.fullName;

      var html      = "<p><img src='"+photo_url+"'/></p><p>"+name+"</p>";

      sendgrid.send({
        to          : to, 
        from        : to, 
        subject     : '[visage-grid] delivery',
        html        : html 
      }, function(err, json) {
        if (err) { 
          console.error(err); 
          process.exit();
        }

        console.log(json);

        process.exit();
      });
    }
  });
});
