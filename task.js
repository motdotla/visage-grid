#!/usr/bin/env node

var dotenv = require('dotenv');
dotenv().load();

var to                  = process.env.TO;
var sendgrid_username   = process.env.SENDGRID_USERNAME; 
var sendgrid_password   = process.env.SENDGRID_PASSWORD; 
var fullcontact_key     = process.env.FULLCONTACT_KEY;

var SendGrid            = require('sendgrid').SendGrid;
var sendgrid            = new SendGrid(sendgrid_username, sendgrid_password);
var fullcontact         = require('fullcontact-api')(fullcontact_key);
var redis               = require('redis');
var db                  = redis.createClient();

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

      var html      = "<p><img src='"+photo_url+"'/></p><ul><li>"+name+"</li></li>";

      sendgrid.send({
        to          : to, 
        from        : to, 
        subject     : '[visage-grid] delivery',
        html        : html 
      }, function(success, message) {
        if (!success) {
          console.log(message);
        } else {
          console.log("Email sent with content: "+html);
        }

        process.exit();
      });
    }
  });
});



