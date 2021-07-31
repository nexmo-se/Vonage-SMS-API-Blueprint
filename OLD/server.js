// TO DO: enable authenticate() line 191
// messageDeploymentId <<<<

// 1. From Genesys to Webhook
// - message chat app
// 2. Send out to Phone (our stuff)
// 3. From phone to App
// 4. From App to Genesys

require('dotenv').config({ path: __dirname + '/.env' });
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var crypto = require('crypto');
var https = require('https');
var localtunnel = require('localtunnel');
var { v4: uuidv4 } = require('uuid');

var { access } = require('fs');

const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;
var accessToken = null;

const messageDeploymentId = ''; // <<<<<<<<<<<<

var app = express();
var PORT = 3000;

const LT_DOMAIN = 'vonage-domain';
const ExtSessionId = uuidv4();

var transcript = [];
/***************************************************************
 * Authenticate with Genesys Cloud using an OAuth Client Cred Grant flow
 */
function authenticate() {
  client
    .loginClientCredentialsGrant(
      process.env.GENESYS_CLIENT_ID,
      process.env.GENESYS_CLIENT_SECRET
    )
    .then((data) => {
      // authenticated
      accessToken = data.accessToken;

      // start express server
      // app.listen(PORT, () => {
      //   console.log(`Server listening on port ${PORT}`);

      //   // Start local tunnel for public internet access
      //   (async () => {
      //     const tunnel = await localtunnel({
      //       port: PORT,
      //       subdomain: LT_SUBDOMAIN,
      //     });

      //     console.log(`Server listening on external URL ${tunnel.url}`);

      //     tunnel.on('close', () => {
      //       // tunnels are closed
      //     });
      //   })();
      // });
    })
    .catch((err) => {
      // handle failure response
      console.log(err);
    });
} // end authenticate()

/***************************************************************
 * This route is used when Genesis sends a message to the end user
 * https://quiet-hound-73.loca.lt/messageFromGenesys
 */
app.post('/messageFromGenesys', (req, res) => {
  console.log('/messagesFromGenesys req.body', req.body);

  const normalizedMessage = req.body;
  const signature = req.headers['x-hub-signature-256'];
  const secretToken = 'MySecretSignature';
  const messageHash = crypto
    .createHmac('sha256', secretToken)
    .update(JSON.stringify(normalizedMessage))
    .digest('base64');

  if (`sha256=${messageHash}` === signature) {
    console.log(JSON.stringify(req.headers));
    console.log('\nGenesys req.body.text', req.body.text);
    transcript.push({
      sender: 'Genesys',
      message: req.body.text,
      purpose: 'agent',
    });
  } else {
    console.log('Webhook Validation Failed!');
  }
  res.status(200).end();
});

/***************************************************************
 * This route is used for the end user to send a message to Genesys
 */
app.post('/messageToGenesys', (req, res) => {
  try {
    sendMessageToGenesys(req.body);
  } catch (error) {
    console.log(error);
  }
});

/***************************************************************
 * Implement the code to send a message to Genesys Open Messaging API
 */
function sendMessageToGenesys(data) {
  if (data.message === '') {
    console.log('No message to send');
    return;
  }

  console.log('sendMessageToGenesys data', JSON.stringify(data));

  var date = new Date();

  const body = JSON.stringify({
    id: ExtSessionId,
    channel: {
      platform: 'Open',
      type: 'Private',
      messageId: uuidv4(),
      to: {
        id: messageDeploymentId,
      },
      from: {
        nickname: data.nickname,
        id: data.id,
        idType: data.idType,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      time: date.toISOString(),
    },
    type: 'Text',
    text: data.message,
    direction: 'Inbound',
  });

  const options = {
    hostname: 'api.mypurecloud.com',
    port: 443,
    path: '/api/v2/conversations/messages/inbound/open',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
      Authorization: 'bearer ' + accessToken,
    },
  };

  console.log('options:', JSON.stringify(options));
  console.log('body:', body);

  const apireq = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (data) => {
      console.log('datachunck');
    });

    res.on('end', () => {
      console.log('on end');
      transcript.push({
        sender: data.nickname,
        message: data.message,
        purpose: 'customer',
      });
    });
  });
  apireq.on('error', (error) => {
    console.log(error);
  });

  apireq.write(body);
  apireq.end();
} // end sendMessagetoGenesys()

/***************************************************************
 * This route is used by the sample UI to display the OM transcript
 */
app.get('/transcript', (req, res) => {
  res.write(JSON.stringify(transcript));
  res.status(200).end();
  transcript = [];
});

// ENABLE THIS <<<<<<<<<<<<<<<<
authenticate();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send(200);
});

app.post('/webhooks/inbound', (req, res) => {
  console.log(req.body);
  res.status(200).end();
});

app.post('/webhooks/status', (req, res) => {
  // console.log(req.body);
  res.status(200).end();
});

// app.listen(3000, () => {
//   console.log(`🌏 http://localhost:3000`);
// });
