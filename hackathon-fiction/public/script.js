const startingString = "Write the dialogue of a long, detailed conversation between David Foster Wallace, Cormac McCarthy, and Jorge Luis Borges in which they debate a good idea for a flash fiction story of approximately 500 words. At the end of your response, write the words “FINAL STORY IDEA: ” followed by a description of the story.";

// Add the event listener to the button
document.getElementById('start-conversation').addEventListener('click', startConversation);

// This function starts the conversation
async function startConversation() {
    try {
        console.log("initial server request");
        const serverResponse = await getServerResponse(startingString);
        console.log("initial server response");
    
        // Slice the messages array to skip the system message and the initial user message
        const messagesToDisplay = serverResponse.messages.slice(1);

        // Append all messages from the conversation
        messagesToDisplay.forEach(message => {
            var cssClass = (message.role === 'user') ? 'user-input' : 'response';
            appendTextToMainBody(message.content, cssClass);
        });

        await triggerAutoConversation();
    }
    catch (error) {
        console.error('An error occurred while making the request:', error);
    }
}

// This function appends a new paragraph with the given text and CSS class to the main body
function appendTextToMainBody(text, cssClass) {
    var mainBody = document.getElementById('mainBody');
    var paragraph = createParagraph(text, cssClass);
    mainBody.appendChild(paragraph);
}

// This function creates and returns a new paragraph element with the given text and CSS class
function createParagraph(text, cssClass) {
    var paragraph = document.createElement('p');
    paragraph.textContent = text;
    paragraph.className = cssClass;
    return paragraph;
}

async function getServerResponse(userInput) {
    const response = await fetch('http://localhost:3000/api/gpt4', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: userInput })
    });

    // Throw an error if the request was not successful
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get and return the response from the server
    const apiResponse = await response.json();
    return apiResponse;
}

// This function initiates the automated conversation on the server
async function triggerAutoConversation() {
    const response = await fetch('http://localhost:3000/api/automated-conversation');
    let index = 2;

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse = await response.json();

    // Append the automated conversation to the main body
    apiResponse.messages.forEach(message => {
        var cssClass = (message.role === 'user') ? 'user-input' : 'response';
        appendTextToMainBody(message.content, cssClass);
    });
}
