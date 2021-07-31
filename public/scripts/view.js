/**
 * This script is focused on the HTML / displaying of data to the page
 */
function updateScroll(){
    let div = document.getElementById('agent-assist');
    div.scrollTop = div.scrollHeight;
}

/**
 * Convert the html content of the canned response to plain text
 */
function htmlToPlain(rawHtml){
    let finalText = rawHtml;
    finalText = finalText.replace(/<\/div>/ig, '\n');
    finalText = finalText.replace(/<\/li>/ig, '\n');
    finalText = finalText.replace(/<li>/ig, '  *  ');
    finalText = finalText.replace(/<\/ul>/ig, '\n');
    finalText = finalText.replace(/<\/p>/ig, '\n');
    finalText = finalText.replace(/<br\s*[\/]?>/gi, "\n");
    finalText = finalText.replace(/<[^>]+>/ig, '');

    return finalText;
}

export default {
    /**
     * Add a new chat message to the page.
     * @param {String} sender sender name to be displayed
     * @param {String} message chat message to be displayed
     */
    addChatMessage(sender, message, purpose){        
        let chatMsg = document.createElement('p');
        chatMsg.textContent = sender + ': ' + message;

        let container = document.createElement('div');
        container.appendChild(chatMsg);
        container.className = 'chat-message ' + purpose;
        document.getElementById('agent-assist').appendChild(container);

        updateScroll();
    }
}