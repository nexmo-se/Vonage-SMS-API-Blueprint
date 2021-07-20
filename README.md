# genesys-open-messaging

## Running the app

```js
// fun localtunnel to expose app to API
lt --port 3000

// At Vonage Dashboard, configure the Application Messages Webhooks URLs
INBOUND URL
https://URL/webhooks/inbound
STATUS URL
https://URL/webhooks/status

// install app dependencies
npm install
yarn start app.js

// open
http://localhost:3000
OR
the url you were provided
```

## How to create integration

1. Create the integration
   Admin > Message Platforms > Add Open Messages > configure Outbound URL

### [localtunnel](https://www.npmjs.com/package/localtunnel)

```js
npm install -g localtunnel
lt --port 3000
```

## References:

> [DevCast Tutorial 18 | Introduction to the Genesys Cloud Open Messaging API](https://www.youtube.com/watch?v=dBEhmO1AaS0)

> [Developer Center](https://developer.genesys.cloud/api/digital/openmessaging/)
