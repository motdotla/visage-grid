#!/usr/bin/env node

var fs = require('fs');
function dotenv() {
  dotenv = {
    environment: process.env.NODE_ENV || "development",

    _loadEnv: function() {
      return dotenv._setKeysAndValuesFromEnvFilePath(".env");
    },
    _loadEnvDotEnvironment: function() {
      return dotenv._setKeysAndValuesFromEnvFilePath(".env."+dotenv.environment);
    },
    _setKeysAndValuesFromEnvFilePath: function(filepath) {
      try {
        var data        = fs.readFileSync(filepath); 
        var content     = data.toString().trim();
        var lines       = content.split('\n');  
        
        for (var i=0; i<lines.length; i++) {
          var key_value_array = lines[i].split("=");
          var key             = key_value_array[0].trim();
          var value           = key_value_array[1].trim(); 
          
          process.env[key]    = value; 
        }
      } catch (e) {
      }

      return true; 
    },
    load: function() {
      dotenv._loadEnvDotEnvironment(); 
      dotenv._loadEnv();

      return true;   
    }
  }

  return dotenv;
}

module.exports = dotenv;

dotenv().load();

var sendgrid_username   = process.env.SENDGRID_USERNAME; 
var sendgrid_password   = process.env.SENDGRID_PASSWORD; 
var fullcontact_key 		= process.env.FULLCONTACT_KEY;

var SendGrid    				= require('sendgrid').SendGrid;
var sendgrid    				= new SendGrid(sendgrid_username, sendgrid_password);
var fullcontact 				= require('fullcontact-api')(fullcontact_key);
var redis       				= require('redis');
var db          				= redis.createClient();

db.smembers("emails", function(err, data) {
	var available_emails 	= data;
	var email 						= available_emails[0];

	fullcontact.person.findByEmail(email, function(err, json) {
    if (err) {
		  console.log(err);
      process.exit();
    } else {
      var photo_url = json.photos[0].url; 
      var name 			= json.contactInfo.fullName;

      var html 			= "<p><img src='"+photo_url+"'/></p><ul><li>"+name+"</li></li>";
      
      console.log(html);

      sendgrid.send({
        to 					: 'scott.motte@sendgrid.com',
        from 				: 'scott.motte@sendgrid.com',
        subject 		: '[visage-grid] delivery',
        html 				: html 
      }, function(success, message) {
        process.exit();
      });
    }
	});
});



