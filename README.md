---
title: Configure Genesys Cloud for two way messaging using Open Messaging Platform and Vonage Messages API
author: { Kitt Phi, Mark Berkland }
indextype: blueprint
icon: blueprint
image: flowchart.png
category: 3
summary: |
  This Genesys Cloud Developer Blueprint provides instructions to configure a middleware to allow a Genesys Cloud Agent to send and receive messages from a Vonage Virtual Number (LVN), using the Open Messaging Platform and Vonage Messages API.
---

![Flowchart for Open Messaging to Vonage Messages API](flowchart.png 'Flowchart for Open Messaging to Vonage Messages API')

- [Solution components](#solution-components 'Goes to the Solutions components section')
- [Software development kits](#software-development-kits 'Goes to the Software development kits section')
- [Prerequisites](#prerequisites 'Goes to the Prerequisites section')
- [Implementation steps](#implementation-steps 'Goes to the Implementation steps section')
- [Additional resources](#additional-resources 'Goes to the Additional resources section')

## Solution components

- **Genesys Cloud Open Messaging platform** - Lightweight integration that facilitates messaging with third-party systems and external messaging services.
- **Vonage Messages API platform** - The Messages API enables you to send messages to customers via their preferred channels (currently Facebook Messenger, WhatsApp, Viber, and SMS/MMS) using a single API.
- **NodeJS Express Server** - This blueprint includes the Projects GitHub Repository containing a script that will run as the Web Server that handles the incoming and outgoing routes.

## Software development kits

- **Genesys Cloud Platform API SDK** - This SDK is used for the initial interaction of agent and customer over chat, SMS and email channels.
- **Vonage NodeJS Server SDK** - This SDK is used to create an instance of the Vonage Messages API by providing Vonage Account and Application Credentials.

## Prerequisites

### Specialized knowledge

- Administrator-level knowledge of Genesys Cloud.
- Experience with using the Genesys Cloud API.
- Experience with Vonage Messages API

### Genesys Cloud and Vonage account

- A Genesys Cloud license. For more information, see [Genesys Cloud pricing](https://www.genesys.com/pricing 'Opens the Genesys Cloud pricing page') on the Genesys website.
- **Recommended** The Master Admin role in Genesys Cloud. For more information, see [Roles and permissions overview](https://help.mypurecloud.com/?p=24360 'Opens the Roles and permissions overview article') in the Genesys Cloud Resource Center.
- Vonage Account. To sign up for a new account, visit [Signup for Vonagage Account](https://dashboard.nexmo.com/sign-up?icid=tryitfree_homepage_nexmodashbdfreetrialsignup_tile&utm_campaign=vonageseo).

## Implementation steps

- [Download the repository containing the project files](#download-the-repository-containing-the-project-files 'Goes to the Download the repository containing the project files section')
- [Configure Express Server](#configure-express-server 'Configure Express Server')
- [Vonage Setup](#vonage-setup 'Vonage Setup')
- [Genesys Setup](#genesys-setup 'Genesys Setup')
- [Start Express Server](#start-express-server 'Start Express Server')

### Download the repository containing the project files

1. Go to the GitHub [https://github.com/nexmo-se/genesys-open-messaging](https://github.com/nexmo-se/genesys-open-messaging 'Opens the genesys open messaging GitHub repository') and clone the repository to your machine.

   **Note** If you don't have access to it, you can contact the slack channel [#ask-cse](https://vonage.slack.com/archives/CNW647A0Y) for inquiry.

### Configure Express Server

1. Rename `env-example` to `.env`. We will populate the Environment Variables later.

   ```js
   mv env-example .env
   ```

2. To make a reachable Webhook URL, we'll need to tunnel our local development server to the public internet so that it is reachable by the Genesys and Vonage APIs. For this example we'll use [Ngrok](https://ngrok.com/), but you can use any similar service or host on your own server as well. After running the command below, we'll get an address back E.g. `https://{NGROK-URL}.ngrok.io`, which you'll use below in step 4 of the Vonage Setup.

   ```js
   ngrok http 3000
   ```

### Vonage Setup

1. The solution requires a Vonage Account and Vonage Virtual Number. If you don't already have an account, you'll need to [Signup for Vonage Account](https://dashboard.nexmo.com/sign-up?icid=tryitfree_homepage_nexmodashbdfreetrialsignup_tile&utm_campaign=vonageseo). If you already have a Vonage Account then you can proceed to the [Vonage Dashboard](https://dashboard.nexmo.com).

2. Purchase a Vonage Virutal Number here at the [Vonage Dashboard](https://dashboard.nexmo.com/your-numbers). Save that Virtual Number to the `VIRTUAL_NUMBER` variable at the`.env` file.

3. Configure Settings for Messages API here at the [Vonage Dashboard](https://dashboard.nexmo.com/settings). At SMS Settings, enable Messages API, then Save Settings. Notice the `API key` and `API secret`. Save that to the `VONAGE_API_KEY` and `VONAGE_API_SECRET` variable at the`.env` file.

4. Create a Vonage Messages API Application here at the [Vonage Dashboard](https://dashboard.nexmo.com/applications). Enable Messages and set the webhooks as below, while replacing `NGROK-URL` with the URL you receieved from Ngrok.

Inbound URL

```js
https://{NGROK-URL}.ngrok.io/messageToGenesys
```

Status URL

```js
https://{NGROK-URL}.ngrok.io/webhooks/status
```

5. While still at the Application settings, click `Generate public and private key` and store that in the root directory of your cloned repository. The file needs to be saved as `private.key`, then Save the Changes.

6. Link the Virtual Number to the Application. If not already `linked`, then link the Virtual Number to the Application by enabling the button. The Status should show `Linked to this Application`.

### Genesys Setup

1.  Add Intergration. Navigate to Genesys Cloud > Admin > Integrations > OAuth. Add Client. You can call the App Name `open-messaging`. Enable `Client Credentials`. Copy and Paste the Client ID to the `GENESYS_CLIENT_ID` variable and the Client Secret to the `GENESYS_CLIENT_SECRET` variable at the `.env` file. Once that's done, save the settings.

2.  Set the `GENESYS_ENVIRONMENT` varible inside the `.env` file to the Environment for which you logged into Genesys Pure Cloud. For us, it was `usw2.pure.cloud`. For some it is `api.mypurecloud.com`.

3.  Add Open Messaging Platform. Navigate to Genesys Cloud > Admin > Message > Platforms. Add Platform. For the Name, you can name it `VonageMessaging`. Set the Outbound Notification Webhook URL to below, while replacing the `NGROK-URL` to the URL you received when running the Ngrok command earlier. Set the Outbound Notification Webhook Signature Secret Token E.g. `MySecretSignature`. Then save the settings.

    ```js
    https://{NGROK-URL}.ngrok.io/messageFromGenesys
    ```

    **Note** If you don't see the Message feature, then you'll need to ask the Organization Administrator to enable this feature.

4.  At the `.env` file, set the `GENESYS_SECRET_TOKEN` to the Outbound Notification Webhook Signature Secret Token you set in the previous step E.g `MySecretSignature`.

5.  Configure Architect Flow for Inbound Message. Navigate to Genesys Cloud > Admin > Architect. Select `Flows: Inbound Message` from the dropdown list. Click `+ Add`, then you can name it `VonageMessage`.

6.  Configure Routing. Navigate to Genesys Cloud > Admin > Routing > Message Routing. Add via `+` icon. You can name Inbound Message Flows `VonageMessage` as you did with the Architect Flow above and Inbound Address to `VonageMessaging`. You can name the Description `Inbound Vonage OpenMessaging`. Set the Intial State to `Transfer to ACD`. You can save the name as `Transfer to ACD` and Queue to `Vonage`. Make sure to Add ACD Skill. Save the settings.

7.  Get the Genesys Message Deployment ID. To retrieve this, we'll use [Postman](https://www.postman.com/) and one of the GET Request from the Genesys Postman Collection. Some instructions can be found in the article [Use Postman to test API calls](https://developer.genesys.cloud/api/rest/postman/). In short, we import the Genesys Postman Collection, set it's Authorization as instructed, along with Variables. Next, inside Postman, we navigate to PureCloud Platform API > api > v2 > conversations > messaging > integrations > open > `Get a list of Open messaging integrations` and execute the request. The Deployement ID will be in the Response within the array `entities[0].id`. Once we have that, we can set the `GENESYS_MESSAGE_DEPLOYMENT_ID` variable in the `.env` file.

    ```js
    https://api.{{environment}}/api/v2/conversations/messaging/integrations/open
    ```

### Start Express Server

1. In another terminal, install the NPM dependencies for the repository:

   ```js
   npm install
   ```

2. Start Express Server:

   ```js
   node server.js
   ```

### Test the Solution

1. Login into Genesys Cloud, at Interactions put the Agent into Queue.

2. To confirm the Agent can receive and send SMS to multiple numbers via using one Vonage Virtual Number, from you phone, you will send an SMS to the Virtual Number. The Agent should then see an incoming call. Answer the Incoming Call, which is an SMS, then respond back. In the terminal, you will see console logs of the start and success of incoming and outgoing traffic via Webhooks.

## Additional resources

- [Grant Client Credentials](https://developer.dev-genesys.cloud/api/rest/authorization/use-client-credentials 'Grant Client Credentials')
- [OAuth Client Credentials Login Flow](https://developer.dev-genesys.cloud/api/tutorials/oauth-client-credentials/#language=nodejs&step=0 'OAuth Client Credentials Login Flow')
- [DevCast Tutorial 18 Introduction to the Genesys Cloud Open Messaging API](https://www.youtube.com/watch?v=dBEhmO1AaS0 'Introduction to the Genesys Cloud Open Messaging API')
- [Making API Calls to PureCloud with Postman](https://www.youtube.com/watch?v=YtFGNkRlfcA&t=5s 'Making API Calls to PureCloud with Postman')
