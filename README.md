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

- [Vonage Account Setup](#vonage-account-setup 'Vonage account setup')
- [Download the repository containing the project files](#download-the-repository-containing-the-project-files 'Goes to the Download the repository containing the project files section')
- [Configure Genesys Cloud for Open Messaging Platform](#configure-genesys-cloud-for-open-messaging-platform 'Configure Genesys Cloud for Open Messaging Platform')
- [Configure Express Server](#configure-express-server 'Configure Express Server')

### Vonage Setup

1. The solution requires a Vonage Account and Vonage Virtual Number. If you don't already have an account, you can sign up [here](https://dashboard.nexmo.com/sign-up?icid=tryitfree_homepage_nexmodashbdfreetrialsignup_tile&utm_campaign=vonageseo).

2. Purchase a Vonage Virutal Number (LVN) [here](https://dashboard.nexmo.com/your-numbers).

3. Conifure Settings for Messages API [here](https://dashboard.nexmo.com/settings). At SMS Settings, enable Messages API then Save Settings.

4. Create a Vonage Messages API Application [here](https://dashboard.nexmo.com/applications).

5. Configure Webhooks

### Download the repository containing the project files

1. Go to the [genesys open messaging repository](https://github.com/nexmo-se/genesys-open-messaging 'Opens the genesys open messaging GitHub repository') in GitHub and clone it to your machine.

### Configure Genesys Cloud for Open Messaging Platform

1. Add Open Messaging Platform

2. Configure Webhooks

### Configure Express Server

1. Rename `env-example` to `.env`

   ```js
   mv env-example .env
   ```

### Run the App

1. Get URL to allow APIs to tunnel to your cloned repository:

   ```js
   ngrok http 3000
   ```

2. In another terminal, Install the NPM dependencies for the repository:

   ```js
   npm install
   ```

3. Run the App:

   ```js
   nodemon server.js
   ```

## Additional resources
