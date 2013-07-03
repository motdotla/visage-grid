#!/usr/bin/env node

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
		return console.log(err) if err

		var photo_url = json.photos[0]; 
		var name 			= json.name;

		var html 			= "<p><img src='"+photo_url+"'/></p><ul><li>"+name+"</li></li>";
		
		sendgrid.send({
			to 					: 'scott.motte@sendgrid.com',
			from 				: 'scott.motte@sendgrid.com',
			subject 		: '[visage-grid] delivery',
			html 				: html 
		}, function(success, message) {
			return true;
		});
	});
});



