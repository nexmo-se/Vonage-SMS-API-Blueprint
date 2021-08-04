require('dotenv').config();
var express = require('express');
var app = express();
var port = 3000;
var cookieParser = require('cookie-parser');
var logger = require('morgan');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// GENESYS
var crypto = require('crypto');
var https = require('https');
const fetch = require('node-fetch');

const clientId = process.env.GENESYS_CLIENT_ID;
const clientSecret = process.env.GENESYS_CLIENT_SECRET;
const environment = process.env.GENESYS_ENVIRONMENT;
const messageDeploymentId = process.env.GENESYS_MESSAGE_DEPLOYMENT_ID;
var accessToken = null;

if (!process.env.GENESYS_CLIENT_ID || !process.env.GENESYS_CLIENT_SECRET) {
  console.log('Missing GENESYS_CLIENT_ID OR GENESYS_CLIENT_SECRET');
  process.exit(1);
}
if (!process.env.GENESYS_MESSAGE_DEPLOYMENT_ID) {
  console.log('Missing GENESYS_MESSAGE_DEPLOYMENT_ID');
  process.exit(1);
}

// VONAGE
const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const VONAGE_APPLICATION_ID = process.env.VONAGE_APPLICATION_ID;
const VONAGE_APPLICATION_PRIVATE_KEY_PATH =
  process.env.VONAGE_APPLICATION_PRIVATE_KEY_PATH;
const VIRTUAL_NUMBER = process.env.VIRTUAL_NUMBER;

if (!VONAGE_API_KEY || !VONAGE_API_SECRET) {
  console.log('VONAGE_API_KEY or VONAGE_API_SECRET missing');
  process.exit(1);
}
if (!VONAGE_APPLICATION_ID || !VONAGE_APPLICATION_PRIVATE_KEY_PATH) {
  console.log(
    'VONAGE_APPLICATION_ID or VONAGE_APPLICATION_PRIVATE_KEY_PATH missing'
  );
  process.exit(1);
}
if (!VIRTUAL_NUMBER) {
  console.log('VIRTUAL_NUMBER missing');
  process.exit(1);
}

const Vonage = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: VONAGE_API_KEY,
  apiSecret: VONAGE_API_SECRET,
  applicationId: VONAGE_APPLICATION_ID,
  privateKey: VONAGE_APPLICATION_PRIVATE_KEY_PATH,
});

// GENESYS
// Test token by getting role definitions in the organization.
function handleTokenCallback(body) {
  return fetch(`https://api.${environment}/api/v2/authorization/roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${body.token_type} ${body.access_token}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        console.log(
          '\n✅ Successfully received role definition by using Access Token.'
        );
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .then((jsonResponse) => {
      // console.log(jsonResponse);
    })
    .catch((e) => console.error(e));
}

// Genesys Cloud Authentication
const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');

fetch(`https://login.${environment}/oauth/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(clientId + ':' + clientSecret).toString(
      'base64'
    )}`,
  },
  body: params,
})
  .then((res) => {
    if (res.ok) {
      console.log(
        '\n✅ Successfully granted Access Token using Client Credentials'
      );
      return res.json();
    } else {
      throw Error(res.statusText);
    }
  })
  .then((jsonResponse) => {
    // SAVE THE GRANT CLIENT CREDENTIAL
    accessToken = jsonResponse.access_token;

    handleTokenCallback(jsonResponse);
  })
  .catch((e) => console.error(e));

// SEND SMS TO VONAGE
const sendToVonage = async (data) => {
  // console.log('sendToVonage DATA: ', data);
  await vonage.channel.send(
    { type: 'sms', number: data.channel.to.id }, // TO_NUMBER
    { type: 'sms', number: VIRTUAL_NUMBER }, // FROM_NUMBER
    {
      content: {
        type: 'text',
        text: data.text,
      },
    },
    (err, data) => {
      if (err) {
        console.error(err);
      } else {
        console.log(
          `\n✅ Vonage successfully received the message, UUID: ${data.message_uuid}`
        );
      }
    }
  );
};

/*****************************************************************
 * This route is used when Genesys sends a message to the end user
 */
app.post('/messageFromGenesys', (req, res) => {
  console.log(`\n🚀 Genesys is sending a message to Vonage`);
  // verify message signature
  const normalizedMessage = req.body;
  const signature = req.headers['x-hub-signature-256'];
  const secretToken = 'MySecretSignature';
  const messageHash = crypto
    .createHmac('sha256', secretToken)
    .update(JSON.stringify(normalizedMessage))
    .digest('base64');

  if (`sha256=${messageHash}` === signature) {
    // console.log('\n/messageFromGenesys req.body\n', req.body); // Call your action on the request here
    // GENESYS AGENT SMS TO LVN
    sendToVonage(req.body);
  } else {
    console.log('\nWebhook Validation Failed!');
  }
  res.status(200).end();
});

/******************************************************************
 * This route is used for the end user to send a message to Genesys
 */
app.post('/messageToGenesys', (req, res) => {
  try {
    console.log(`\n🚀 Vonage is sending a message to Genesys`);
    sendToGenesys(req.body);
  } catch (error) {
    console.log(error);
  }
  res.status(200).end(); // Responding is important
});

/********************************************************************
 * Implement the code to send a message to Genesys Open Messaging API
 */
function sendToGenesys(data) {
  if (data.message === '') {
    console.log('\nNo message to send');
    return;
  }

  var d = new Date();

  // build payload; will go to Genesys
  const body = JSON.stringify({
    id: data.message_uuid,
    channel: {
      platform: 'Open',
      type: 'Private',
      messageId: data.message_uuid, // FROM VONAGE
      to: {
        id: messageDeploymentId,
      },
      from: {
        nickname: data.from.number,
        id: data.from.number,
        idType: 'Phone',
        firstName: '',
        lastName: '',
      },
      time: d.toISOString(),
    },
    type: 'Text',
    text: data.message.content.text,
    direction: 'Inbound',
  });

  const options = {
    // hostname: 'api.mypurecloud.com',	// postman will return "invalid credentials"
    hostname: 'api.usw2.pure.cloud',
    port: 443,
    path: '/api/v2/conversations/messages/inbound/open',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
      Authorization: 'bearer ' + accessToken,
    },
  };

  const apireq = https.request(options, (res) => {
    console.log(
      `\n✅ Genesys successfully received the message, statusCode: ${res.statusCode}`
    );
  });

  apireq.on('error', (error) => {
    console.error('\nFailed to send message to Genesys: ', error);
  });

  try {
    apireq.write(body);
    apireq.end();
  } catch (error) {
    console.log(error);
  }
}

// VONAGE
app.post('/webhooks/status', (req, res) => {
  // console.log(req.body);
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`🌏 Server is listening`);
});
