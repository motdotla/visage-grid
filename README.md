# visage-grid

Get an email each day of an acquaintance's face. You guess their name.

## Deploying

#### On Heroku

```bash
heroku create
heroku addons:add redistogo
heroku addons:add scheduler:standard
heroku addons:add sendgrid:starter
heroku config:set FULLCONTACT_KEY=yourfullcontactapikey
git push heroku master
curl -X POST http://yourherokusubdomain.herokuapp.com/emails -d "email=you@youremail.com"
```

Finally, setup a recurring task each morning to send you the email. Use heroku scheduler for this. Add the job to look like this:

|Task       | Dyno Size | Frequency |
|-----------|-----------|-----------|
|node ./task.js|  1x    | Daily     |
