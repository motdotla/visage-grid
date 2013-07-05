# visage-grid

Get an email each day of an acquaintance's face. You guess their name.

## Deploying

#### On Heroku

```bash
heroku create
heroku addons:add redistogo
heroku addons:add scheduler:standard
git push heroku master
```
