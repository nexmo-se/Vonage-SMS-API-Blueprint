---
title: Configure Genesys Cloud for two way messaging using Open Messaging Platform and Vonage Messages API
author: { Mark, Berkland, Kitt Phi }
indextype: blueprint
icon: blueprint
image: assets/img/open_messaging_vonage_messages_api_diagram.png
category: 3
summary: |
  This Genesys Cloud Developer Blueprint provides instructions to configure a middleware to allow a Genesys Cloud Agent to send and receive messages from a Vonage Virtual Number (LVN), using the Open Messaging Platform and Vonage Messages API.
---

![Flowchart for Open Messaging to Vonage Messages API](flowchart.png 'Flowchart for Open Messaging to Vonage Messages API')

- [Solution components](#solution-components 'Goes to the Solutions components section')
- [Software development kits](#software-development-kits 'Goes to the Software development kits section')
- [Prerequisite configuration and considerations](#prerequisite-configuration-and-considerations 'Goes to the Prerequisite configuraiton and considerations section')
- [Prerequisites](#prerequisites 'Goes to the Prerequisites section')
- [Implementation steps](#implementation-steps 'Goes to the Implementation steps section')
- [Additional resources](#additional-resources 'Goes to the Additional resources section')

## Solution components

- **Genesys Cloud Open Messaging platform** -
- **Vonage Messages API platform**
- **NodeJS App and Web Server**

## Software development kits

- **Genesys Cloud Platform API SDK** - This SDK is used for the initial interaction of agent and customer over chat, SMS and email channels.
- **Vonage Video Server NodeJS SDK** - This SDK is used to generate sessions and tokens.

## Prerequisites

### Specialized knowledge

- Administrator-level knowledge of Genesys Cloud.
- Experience with using the Genesys Cloud API.
- Experience with Vonage Messages API

### Genesys Cloud and Vonage account

- A Genesys Cloud license. For more information, see [Genesys Cloud pricing](https://www.genesys.com/pricing 'Opens the Genesys Cloud pricing page') on the Genesys website.
- (Recommended) The Master Admin role in Genesys Cloud. For more information, see [Roles and permissions overview](https://help.mypurecloud.com/?p=24360 'Opens the Roles and permissions overview article') in the Genesys Cloud Resource Center.
- Vonage Account

## Implementation steps

- [Download the repository containing the project files](#download-the-repository-containing-the-project-files 'Goes to the Download the repository containing the project files section')
- [Configure Express Server](#configure-express-server 'Configure Express Server')
- [Vonage Setup](#vonage-setup 'Vonage Setup')
- [Genesys Setup](#genesys-setup 'Genesys Setup')
- [Start Express Server](#start-express-server 'Start Express Server')

### Download the repository containing the project files

1. Go to the [genesys open messaging repository](https://github.com/nexmo-se/genesys-open-messaging 'Opens the genesys open messaging GitHub repository') in GitHub and clone it to your machine.

### Configure Express Server

1. Rename `env-example` to `.env`. We will populate the Environment Variables later.

   ```js
   mv env-example .env
   ```

2. Use [Ngrok](https://ngrok.com/) to get an External URL to allow Genesys and Vonage APIs to tunnel to your cloned repository. We will use the URL later when setting our Webhooks:

   ```js
   ngrok http 3000
   ```

### Vonage Setup

1. The solution requires a Vonage Account and Vonage Virtual Number. If you don't already have an account, you'll need to [sign up](https://dashboard.nexmo.com/sign-up?icid=tryitfree_homepage_nexmodashbdfreetrialsignup_tile&utm_campaign=vonageseo). If you already have a Vonage Account then you can proceed to the [Vonage Dashboard](https://dashboard.nexmo.com).

2. Purchase a Vonage Virutal Number at the [Vonage Dashboard](https://dashboard.nexmo.com/your-numbers). Save that Virtual Number to the `VIRTUAL_NUMBER` variable at the`.env` file.

3. Configure Settings for Messages API at the [Vonage Dashboard](https://dashboard.nexmo.com/settings). At SMS Settings, enable Messages API, then Save Settings. Notice the `API key` and `API secret` which you'll need later.

4. Create a Vonage Messages API Application [here](https://dashboard.nexmo.com/applications). Enable Messages and set the webhooks as below, while replacing the `NGROK-URL` with the URL you receieved from Ngrok.

Inbound URL

```js
https://{NGROK-URL}.ngrok.io/messageToGenesys
```

Status URL

```js
https://{NGROK-URL}.ngrok.io/webhooks/status
```

5. While still inside the Application, click "Generate public and private key" and store that in the root directory of your cloned repository. The file should be saved as `private.key`, then Save the Changes.

6. Link the Virtual Number to the Application. If not already `linked`, then link the Virtual Number to the Application by enabling the button. The Status should show "Linked to this Application".

### Genesys Setup

1.  Add Intergration. Navigate to Genesys Cloud > Admin > Integrations > OAuth. Add Client. You can call the App Name `open-messaging`. Enable `Client Credentials`. Copy and Paste the Client ID to the `GENESYS_CLIENT_ID` variable and the Client Secret to the `GENESYS_CLIENT_SECRET` variable of the `.env` file. Once that's done, save the settings.

2.  Set the `GENESYS_ENVIRONMENT` varible inside the `.env` file to the Environment for which you logged into Genesys Cloud. For us, it was `usw2.pure.cloud`. For some it is `api.mypurecloud.com`.

3.  Add Open Messaging Platform. Navigate to Genesys Cloud > Admin > Message > Platforms. Add Platform. For the Name, you can name it `VonageMessaging`. Set the Outbound Notification Webhook URL to below, while replacing the `NGROK-URL` to the URL you received when running the Ngrok command earlier. You can set the Outbound Notification Webhook Signature Secret Token to `This is a Secret`. Then save the settings.

    ```js

    https://{NGROK-URL}.ngrok.io/messageFromGenesys

    ```

    **Note** If you don't see the Message option, then you'll need to ask the Organization Administrator to enable this feature.

4.  Configure Architect Flow for Inbound Message. Navigate to Genesys Cloud > Admin > Architect. Select `Flows: Inbound Message` from the dropdown list. Click `+ Add`, then you can name it `VonageMessage`.

5.  Configure Routing. Navigate to Genesys Cloud > Admin > Routing > Message Routing. Add via `+` icon. You can name both the Inbound Message Flows and Inbound Address to `VonageMessage` as you did with the Architect Flow above. You can name the Description `Inbound Vonage OpenMessaging`. Set the Intial State to `Transfer to ACD`. You can save the name as `Transfer to ACD` and Queue to `Vonage`. Make sure to Add ACD Skill. Save the settings.

### Start Express Server

1. In another terminal, install the NPM dependencies for the repository:

   ```js
   npm install
   ```

2. Start Express Server:

   ```js
   nodemon server.js
   ```

### Test the Solution

1. Login into Genesys Cloud, at Interactions put the Agent into Queue.

2. To confirm the Agent can receive and send SMS to multiple number via using one Vonage Virtual Number, from you phone, send an SMS to the Virtual Number. The Agent should then see an incoming call, answer the Incoming SMS and Respond back. The logs in the terminal should confirm the start and success of incoming and outgoing traffic via Webhooks.

## Additional resources

- [Grant Client Credentials](https://developer.dev-genesys.cloud/api/rest/authorization/use-client-credentials 'Grant Client Credentials')
- [OAuth Client Credentials Login Flow](https://developer.dev-genesys.cloud/api/tutorials/oauth-client-credentials/#language=nodejs&step=0 'OAuth Client Credentials Login Flow')
- [DevCast Tutorial 18 Introduction to the Genesys Cloud Open Messaging API](https://www.youtube.com/watch?v=dBEhmO1AaS0 'Introduction to the Genesys Cloud Open Messaging API')
