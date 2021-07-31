import view from './view.js';

let userId = '';
let agentName = 'AGENT_NAME';
let agentAlias = 'AGENT_ALIAS';
let customerName = 'CUSTOMER_NAME';
let currentConversation = null;
let currentConversationId = '';
let translationData = null;
let genesysCloudLanguage = 'en-us';
let translateKey = '';

const intervalId = setInterval(function(){ 
    try {
        $.ajax({
            type: "GET",
            url: "/transcript",
            success: function(data) {
                if (data !== '[]') {
                    console.log("transcript: " + JSON.stringify(data));
                    var transcript = JSON.parse(data);
                    transcript.forEach((item) => {
                        view.addChatMessage(item.sender, item.message, item.purpose);
                    })
                }
            },
            error: function(xhr, status, err) {
                console.log(err);
            }
        });
    } catch(e) {
        console.log(e);
    }

}, 1000);

/**
 * Callback function for 'message' and 'typing-indicator' events.
 * 
 * @param {Object} data the event data  
 */
let onMessage = (data) => {
    switch(data.metadata.type){
        case 'typing-indicator':
            break;
        case 'message':
            // Values from the event
            let eventBody = data.eventBody;
            let message = eventBody.body;
            let senderId = eventBody.sender.id;

            // Conversation values for cross reference
            let participant = currentConversation.participants.find(p => p.chats[0].id == senderId);
            let name = participant.name;
            let purpose = participant.purpose;

            // Wait for translate to finish before calling addChatMessage
            translate.translateText(message, genesysCloudLanguage, function(translatedData) {
                view.addChatMessage(name, translatedData.translated_text, purpose);
                translationData = translatedData;
            });

            break;
    }
};

/**
 *  Translate then send message to the customer
 */
function sendChat(){
    console.log("sending chat message");
    let message = document.getElementById('message-textarea').value;

    try {
        $.ajax({
            type: "POST",
            url: "/messageToGenesys",
            data: {
                "nickname": "Jim",
                "id": "crespino4@yahoo.com",
                "idType": "email",
                "firstName": "Jim",
                "lastName": "Crespino",
                "message": message
            },
            success: function(data) {
                console.log("message sent to Genesys");
            },
            error: function(xhr, status, err) {
                console.log(err);
            }
        });
    } catch(e) {
        console.log(e);
    }

    document.getElementById('message-textarea').value = '';
};

/**
 *  Send message to the customer
 */
function sendMessage(message, conversationId, communicationId){
    console.log(message);
    conversationsApi.postConversationsChatCommunicationMessages(
        conversationId, communicationId,
        {
            'body': message,
            'bodyType': 'standard'
        }
    )
}

/**
 * Show the chat messages for a conversation
 * @param {String} conversationId 
 * @returns {Promise} 
 */
function showChatTranscript(conversationId){
    return conversationsApi.getConversationsChatMessages(conversationId)
    .then((data) => {
        // Show each message
        data.entities.forEach((msg) => {
            if(msg.hasOwnProperty('body')) {
                let message = msg.body;

                // Determine the name by cross referencing sender id 
                // with the participant.chats.id from the conversation parameter
                let senderId = msg.sender.id;
                let name = currentConversation
                            .participants.find(p => p.chats[0].id == senderId)
                            .name;
                let purpose = currentConversation
                            .participants.find(p => p.chats[0].id == senderId)
                            .purpose;

                // Wait for translate to finish before calling addChatMessage
                translate.translateText(message, genesysCloudLanguage, function(translatedData) {
                    view.addChatMessage(name, translatedData.translated_text, purpose);
                    translationData = translatedData;
                });
            }
        });
    });
}
    

/** --------------------------------------------------------------
 *                       EVENT HANDLERS
 * -------------------------------------------------------------- */
document.getElementById('chat-form')
    .addEventListener('submit', () => sendChat());

document.getElementById('btn-send-message')
    .addEventListener('click', () => sendChat());

document.getElementById('message-textarea')
    .addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendChat();
            if(e.preventDefault) e.preventDefault(); // prevent new line
            return false; // Just a workaround for old browsers
        }
    });

