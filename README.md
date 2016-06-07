# nobreaks-api

Create a `nobreaks.conf.json` file in the root of the directory

Use the following structure and plug it in with your API information:

```
{
  "battlenet": {
    "id": "2153",
    "host": "https://us.api.battle.net",
    "key": "",
    "secret": ""
  }
}
```

```
$ npm install
$ node index.js
```


You can now open a browser and go to any of the available endpoints.

For example: `http://localhost:5002/v1/guild/members`
