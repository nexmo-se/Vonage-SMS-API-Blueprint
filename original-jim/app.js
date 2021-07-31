/********************************************
 * An example Express NodeJS app that
 * implements Genesys Cloud Open Messaging
 */
const express = require('express');
const crypto = require('crypto');
const https = require('https');
const localtunnel = require('localtunnel');
const { v4: uuidv4 } = require('uuid');
const config = require('./config.js');
const { access } = require('fs');

// Gotta have the Genesys Cloud Platform API
const platformClient = require('purecloud-platform-client-v2');
const client = platformClient.ApiClient.instance;
var accessToken = null;

// const messageDeploymentId = '32e757cb-3438-40b7-b41d-984d3e1c2ecd';
const messageDeploymentId = '8561c542-48cf-47ca-81ce-8898cb37971b';

// Initialize express and define a port
const app = express();
const PORT = 3000;

// Reserved domain name for Local Tunnel
const LT_SUBDOMAIN = 'crespino-om';

const ExtSessionId = uuidv4();

// Tell express to use body-parser's JSON parsing
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static('web'));

var transcript = [];

/***************************************************
 * Authenticate with Genesys Cloud using an
 * OAuth Client Credentials Grant flow
 */
function authenticate() {
  client
    .loginClientCredentialsGrant(config.clientId, config.clientSecret)
    .then((data) => {
      // Do authenticated things
      accessToken = data.accessToken;

      // Start express on the defined port
      app.listen(PORT, () => {
        console.log(`Server listenign on local port ${PORT}`);

        // Start Local Tunnel for public internet access
        (async () => {
          const tunnel = await localtunnel({
            port: PORT,
            subdomain: LT_SUBDOMAIN,
          });

          console.log(`Server listening on external URL ${tunnel.url}`);

          tunnel.on('close', () => {
            // tunnels are closed
          });
        })();
      });
    })
    .catch((err) => {
      // Handle failure response
      console.log(err);
    });
}

/*****************************************************************
 * This route is used when Genesys sends a message to the end user
 */
app.post('/messageFromGenesys', (req, res) => {
  console.log('received a message from Genesys');

  // verify message signature
  const normalizedMessage = req.body;
  const signature = req.headers['x-hub-signature-256'];
  const secretToken = 'MySecretSignature';
  const messageHash = crypto
    .createHmac('sha256', secretToken)
    .update(JSON.stringify(normalizedMessage))
    .digest('base64');

  if (`sha256=${messageHash}` === signature) {
    console.log(JSON.stringify(req.headers));
    console.log(req.body); // Call your action on the request here
    console.log('\nGenesys> ' + req.body.text);
    transcript.push({
      sender: 'Genesys',
      message: req.body.text,
      purpose: 'agent',
    });
  } else {
    //console.log("Webhook Validation Failed!");
  }

  res.status(200).end(); // Responding is important
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

  console.log('Sending message to Genesys: ' + JSON.stringify(data));

  var d = new Date();

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
      time: d.toISOString(),
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

  console.log('options: ' + JSON.stringify(options));
  console.log('body: ' + body);

  const apireq = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (d) => {
      console.log('datachunk');
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

authenticate();
