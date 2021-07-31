require('dotenv').config();
var express = require('express');
var app = express();
var port = 3000;
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// GENESYS
var crypto = require('crypto');
var https = require('https');
const fetch = require('node-fetch');

const clientId = process.env.GENESYS_CLIENT_ID;
const clientSecret = process.env.GENESYS_CLIENT_SECRET;
const environment = process.env.GENESYS_ENVIRONMENT;
var accessToken = null;
if (!process.env.GENESYS_CLIENT_ID || !process.env.GENESYS_CLIENT_SECRET) {
  console.log('Missing GENESYS_CLIENT_ID OR GENESYS_CLIENT_SECRET');
}
const messageDeploymentId = '8561c542-48cf-47ca-81ce-8898cb37971b';
var transcript = [];

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
        console.log('Successfully received role definition with token.');
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
      console.log('Successfully granted access_token using client_credentials');
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
  console.log('sendToVonage DATA: ', data);
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
        console.log('Vonage Message UUID: ', data.message_uuid);
      }
    }
  );
};

/*****************************************************************
 * This route is used when Genesys sends a message to the end user
 */
app.post('/messageFromGenesys', (req, res) => {
  // verify message signature
  const normalizedMessage = req.body;
  const signature = req.headers['x-hub-signature-256'];
  const secretToken = 'MySecretSignature';
  const messageHash = crypto
    .createHmac('sha256', secretToken)
    .update(JSON.stringify(normalizedMessage))
    .digest('base64');

  if (`sha256=${messageHash}` === signature) {
    console.log(
      '\n/messageFromGenesys req.headers\n',
      JSON.stringify(req.headers)
    );
    console.log('\n/messageFromGenesys req.body\n', req.body); // Call your action on the request here
    console.log('\n/messageFromGenesys req.body.text\n' + req.body.text);

    // GENESYS AGENT SMS TO LVN
    sendToVonage(req.body);

    // WEB GUI
    transcript.push({
      sender: 'Genesys',
      message: req.body.text,
      purpose: 'agent',
    });
    console.log('TRASNSCRIPT: ', transcript);
  } else {
    console.log('Webhook Validation Failed!');
  }
  res.status(200).end();
});

/******************************************************************
 * This route is used for the end user to send a message to Genesys
 */
app.post('/messageToGenesys', (req, res) => {
  try {
    sendMessageToGenesys(req.body);
  } catch (e) {
    // TODO: do some error handling
  }
  res.status(200).end(); // Responding is important
});

/********************************************************************
 * Implement the code to send a message to Genesys Open Messaging API
 */
function sendMessageToGenesys(data) {
  if (data.message === '') {
    console.log('No message to send');
    return;
  }

  console.log('\n/messageToGenesys DATA-start', data); // req.body
  var d = new Date();

  // build payload; will go to Genesys
  const body = JSON.stringify({
    id: data.message_uuid, // uuidv4();
    channel: {
      platform: 'Open',
      type: 'Private',
      messageId: data.message_uuid, // FROM VONAGE // uuidv4(),
      to: {
        id: messageDeploymentId, // 8561c542-48cf-47ca-81ce-8898cb37971b
      },
      from: {
        nickname: data.from.number, // data.nickname
        id: data.from.number, // data.id
        idType: 'email', // data.idType
        firstName: '', // data.firstName
        lastName: '', // data.lastName
      },
      time: d.toISOString(),
    },
    type: 'Text',
    text: data.message.content.text, // data.message
    direction: 'Inbound',
  });
  console.log('\n /messageToGenesys BODY \n', body);

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

  // console.log('options: ' + JSON.stringify(options));
  // console.log('body: ' + body);

  const apireq = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (d) => {
      // console.log('datachunk');
    });

    res.on('end', () => {
      console.log('on end');
      transcript.push({
        sender: data.from.number,
        message: data.message.content.text,
        purpose: 'customer',
      });
      console.log('TRANSCRIPT:', transcript);
      console.log('DATA-end', data);
    });
  });

  apireq.on('error', (error) => {
    console.error(error);
  });

  apireq.write(body);
  apireq.end();
}

/******************************************************************
 * This route is used by the sample UI to display the OM transcript
 */
app.get('/transcript', (req, res) => {
  res.write(JSON.stringify(transcript));
  res.status(200).end();
  transcript = [];
});

// VONAGE
app.post('/webhooks/status', (req, res) => {
  // console.log(req.body);
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`🌏 Server is listening...`);
});
