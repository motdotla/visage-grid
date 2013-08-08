# visage-grid

Get an email each day of an acquaintance's face. You guess their name.

## Deploying

### Heroku

```bash
heroku create
heroku addons:add redistogo
heroku addons:add scheduler:standard
heroku addons:add sendgrid:starter
heroku config:set FULLCONTACT_KEY=yourfullcontactapikey
heroku config:set TO=your@email.com
git push heroku master
```

## Usage

Setup your SendGrid account to parse emails.

Go to [http://sendgrid.com/developer/reply](http://sendgrid.com/developer/reply).

Set your hostname as `m.yourdomain.com` and set your url as `https://yoursubdomain.herokuapp.com/emails/parse`. Save that.

[screenshot 1](https://raw.github.com/scottmotte/visage-grid/master/readme/sendgrid-inbound-1.png), [screenshot 2](https://raw.github.com/scottmotte/visage-grid/master/readme/sendgrid-inbound-2.png)

Then go to your domain's DNS dashboard and add the MX record with the hostname `m.yourdomain.com` with the value of `mx.sendgrid.net`. 

[screenshot 1](https://raw.github.com/scottmotte/visage-grid/master/readme/sendgrid-mx-record.png)

Finally, setup all your emails to forward to `email@m.yourdomain.com`. You can do this in GMail by going to Settings > Forwarding & POP/IMAP and adding a forward address to `email@m.yourdomain.com`.

[screenshot 1](https://raw.github.com/scottmotte/visage-grid/master/readme/gmail-forward-1.jpg)

Lastly, setup a recurring task each morning to send you the email. Use heroku scheduler for this. Add the job to look like this:

|Task       | Dyno Size | Frequency |
|-----------|-----------|-----------|
|node ./task.js|  1x    | Daily     |

[screenshot 1](https://raw.github.com/scottmotte/visage-grid/master/readme/heroku-scheduler.png)

### Optional Usage

You can also add additional emails via the web API. For example, to add using curl do the following.

```bash
curl -X POST http://yourherokusubdomain.herokuapp.com/emails -d "email=you@youremail.com"
```

