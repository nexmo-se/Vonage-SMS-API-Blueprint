---
title: Update a Genesys Cloud Do Not Contact list with the Genesys Cloud for Salesforce SDK
author: { author name }
indextype: blueprint
icon: blueprint
image: assets/img/update_genesyscloud_dnclist_with_genesyscloud_slf_sdk_workflow_diagram.png
category: 3
summary: |
  This Genesys Cloud Developer Blueprint provides instructions for deploying a chat assistant in Genesys Cloud. The chat assistant actively listens to a chat interaction and suggests responses based on keywords. This blueprint uses the Chat API to send messages and provide type ahead suggestions to agents in the Interaction Widget integration.
---

{front matter that appears above between ---}

[comment]: # Title format: imperative verb + noun in sentence case. Example in front matter (between ---).

[comment]: # Categories: 0: Introduction to Genesys Cloud Development; 1: Identity and Access Management; 2: Organization and People; 3: Telephony Configuration and Integration; 4: Flows, Schedules and Routing; 5: Contact Center Configuration; 6 Infrastructure and Integration; 7: Communications Channels; 8: Account Settings; 9: Notification and Communication; 10: Documents; 11: Data Reporting and Quality; 12: Workforce Management. Example in front matter (between ---).

[comment]: # Image: location of the image. Example in front matter (between ---).

[comment]: # Summary: copy the introductory text. Example in front matter (between ---).

{introductory text}

[comment]: # Introductory text: 2 to 3 sentences. What solution does, how it does it, why use this solution. Example text follows.

This Genesys Cloud Developer Blueprint provides instructions for deploying a chat assistant in Genesys Cloud. The chat assistant actively listens to a chat interaction and suggests responses based on keywords. This blueprint uses the Chat API to send messages and provide type ahead suggestions to agents in the Interaction Widget integration.

{diagram}

[comment]: # Diagram should show high-level, end-to-end solution. Format and example follows.

![{alt text for accessibility}](images/{file name}.png "{hover text}")

![Flowchart for the chat assistant solution](images/flowchart_chat_assistant.png 'Flowchart for the chat assistant solution')

{TOC}

[comment]: # List links to all H2 sections in blueprint. Example follows.

- [Solution components](#solution-components 'Goes to the Solutions components section')
- [Software development kits](#software-development-kits 'Goes to the Software development kits section')
- [Prerequisite configuration and considerations](#prerequisite-configuration-and-considerations 'Goes to the Prerequisite configuraiton and considerations section')
- [Prerequisites](#prerequisites 'Goes to the Prerequisites section')
- [Implementation steps](#implementation-steps 'Goes to the Implementation steps section')
- [Additional resources](#additional-resources 'Goes to the Additional resources section')

## Solution components

[comment]: # List components in logical order (for example, alphabetical, order of use in the solution, Genesys vs. third-party components, large components followed by smaller ones) Copy description from library, if description exists. Otherwise, follow format and brevity of descriptions in library. Format and examples follow.

- **{component name}** - {Description: first line as a nominal phrase, additional lines as complete sentences.}
- **Genesys Cloud API** - A set of RESTful APIs that allows you to extend and customize your Genesys Cloud environment. This solution uses the API to send meeting information to the caller as an agentless outbound SMS notification.
- **Data actions** - Either static (preconfigured) actions or custom actions that you create to leverage the Genesys Platform API. Use these data actions to make routing decisions within your interaction flow in Architect, to present information to your agents in Scripts, or to act on data in other ways.

## Software development kits

[comment]: # Include section if any SDKs are used in the solution. List Genesys SDKs first in order of use, followed by third-party SDKs in order of use. Copy description from library, if description exists. Otherwise, follow format and brevity of descriptions in library. Format and example follow.

- **{SDK name}** - {Description: first line as a nominal phrase, additional lines as complete sentences.}
- **Genesys Cloud Platform API SDK** - Client libraries used to simplify application integration with Genesys Cloud by handling low-level HTTP requests. In this solution, initiates an interaction between an agent and a customer over chat, SMS, and email channels.

## Prerequisites

### Specialized knowledge

[comment]: # List specialized knowledge. Copy appropriate items from library, if description exists. Otherwise, follow format and brevity of descriptions in library. Examples follow.

- Administrator-level knowledge of Genesys Cloud.
- Experience with using the Genesys Cloud API.

### {Type of} account

[comment]: # Add separate H3 sections for each account, for example, Genesys Cloud account, Vonage account, Salesforce account. Example text follows.

- A Genesys Cloud license. For more information, see [Genesys Cloud pricing](https://www.genesys.com/pricing 'Opens the Genesys Cloud pricing page') on the Genesys website.
- (Recommended) The Master Admin role in Genesys Cloud. For more information, see [Roles and permissions overview](https://help.mypurecloud.com/?p=24360 'Opens the Roles and permissions overview article') in the Genesys Cloud Resource Center.

## Implementation steps

[comment]: # Add mini-TOC of links to H3 sections. These sections are the implementation steps for the solution. Step name format: imperative verb + noun in sentence case, for example, Download the repository containing the project files. Format and examples follow.

- [{step name}](#{step-name} 'hover text')
- [Download the repository containing the project files](#download-the-repository-containing-the-project-files 'Goes to the Download the repository containing the project files section')
- [Create an OAuth client in Genesys Cloud](#create-an-oauth-client-in-genesys-cloud 'Goes to the Create an OAuth client for Genesys Cloud section')
- [Set up an Interaction Widget integration in Genesys Cloud](#set-up-an-interaction-widget-integration-in-genesys-cloud 'Goes to the Set up an Interaction Widget integration in Genesys Cloud section')

[comment]: # The following three sections are example implementation step sections. All are H3. Section title format: imperative verb + noun in sentence case.

### Download the repository containing the project files

1. Go to the [chat-assistant-blueprint repository](https://github.com/MyPureCloud/chat-assistant-blueprint 'Opens the chat-assistant-blueprint GitHub repository') in GitHub and clone it to your machine.

### Create an OAuth client in Genesys Cloud

1. Log in to your Genesys Cloud organization.
2. Create an OAuth client that uses the Token Implicit Grant (Browser) grant type. For more information, see [Create an OAuth client](https://help.mypurecloud.com/?p=188023 'Opens the Create an OAuth client article') in the Genesys Cloud Resource Center.
3. Add your hosted site to the **Authorized redirect URIs** text box.
4. Modify the **main.js** file with the Client ID for the OAuth client. The Client ID is passed into `loginImplicitGrant`.

### Set up an Interaction Widget integration in Genesys Cloud

1. Log in to your Genesys Cloud organization and add the Interaction Widget integration. For more information, see [Add an integration](https://help.mypurecloud.com/?p=135807 'Opens the Adds an integration article') in the Genesys Cloud Resource Center.

   ![Add the integration](images/add-integration.png 'Add the integration')

2. Install the Interaction Widget integration.

   ![Install the integration](images/install-interaction-widget.png 'Install the integration')

3. (Optional) Change the integration name to a more meaningful name, for example, to Chat Translator.

   ![Name the integration](images/name-interaction-widget.png 'Name the integration')

4. Click the **Configuration** tab.

   a. In the **Application URL** box, type the URL of the web application.

   - Be sure to specify the full URL. Include `https:` at the beginning of the URL.
   - Also add the URL parameter `pcConversationId` at the end of the URL. This parameter ensures that the solution will pass the active conversation ID to the solution.

     ```
     /?conversationid={pcConversationId}
     ```

   b. Click **Select Groups** and add groups. The Interaction Widget is only visible to members of these groups.

   c. Click **Select Queues** and add queues. The Interaction Widget is only visible in these queues.

   d. Add **Communication Types**. The Interaction Widget is only visible on these types of interactions.

   ![Integration configuration](images/interaction-widget-config.png 'Integration configuration')

5. Click **Save**.
6. Click **Inactive** to activate the integration.

[comments]: # Use the correct label and formatting for notes, tips, important items, and warnings. Format and examples follow.

:::primary
**Note**: I am a note! It's a good idea to read me.
:::
:::primary
**Note**: If **Setting Type** is grayed out, then enable **Manage List Custom Settings Type**.
:::

:::primary
**Tip**: Hey, I suggest alternatives that you might not be aware of.
:::
:::primary
**Tip**: To ensure that the integration finds phone numbers, confirm that all of your phone numbers in your third-party system are in digit-only format (for example, 13175550125).
:::

:::primary
**Important**: I am an important note. If you ignore me, things may not work as expected but you won't suffer data loss.
:::
:::primary
**Important**: Due to Salesforce and Genesys Cloud limits, we recommend only syncing 1,000 campaign members in total for each sync job. Higher numbers might work but not in all cases.
:::

:::warning
**Warning**: I am a warning. If you do not pay attention to me, something catastrophic will happen, like the loss of data.
:::
:::warning
**Warning**: Transcripts greater than 131,072 characters fail to save.
:::

## Additional resources

[comment]: # Do not list any links mentioned in the blueprint. List any links to Genesys or third-party material that provide further background. Format and examples follow.

- [{link name}]({URL} '{hover text}') {website where the link goes to if it is NOT in the Genesys Cloud Developer Center}
- [Agent Chat Assistant Tutorial](https://developer.mypurecloud.com/api/tutorials/agent-chat-assistant/?language=javascript&step=1 'Opens the Agent Chat Assistant tutorial')
- [Agent Chat Assistant blog](https://developer.mypurecloud.com/blog/2020-02-19-agent-chat-assistant/ 'Opens the Agent Chat Assistant blog')
- [About Campaign Management in Genesys Cloud for Salesforce](https://help.mypurecloud.com/?p=153769 'Opens the About Campaign Management in Genesys Cloud for Salesforce article') in the Genesys Cloud Resource Center
- The [chat-assistant-blueprint](https://github.com/GenesysCloudBlueprints/chat-assistant-blueprint "Opens the chat-assistant-blueprint repository in GitHub) repository in GitHub
