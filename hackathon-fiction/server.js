require('dotenv').config();

const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
const app = express();

// Completion API inputs
const string1 = "Write the flash fiction story described in FINAL STORY IDEA. Do not make the plot overly complicated. Make sure there is at least some dialogue. Avoid cliches and flowery language. Focus on good pacing and having a variety of sentence types.";
const string2 = "Write a long, detailed dialogue of a writing workshop in which Wallace, McCarthy, and Borges give ruthless, brutally honest, slightly mean-spirited, but also very wise and intelligent criticisms of the story that was just written.";
const string3 = "Rewrite the story, being extremely diligent and thorough in incorporating every bit of advice that was just given by the three writers.";

app.use(express.json());

const configuration = new Configuration({
     apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.static('public'));
app.get('/', sendHomePage);
app.post('/api/gpt4', processUserPrompt);
app.get('/api/automated-conversation', autoConversation);

let messages = [
  { "role": "system", "content": "You are a helpful assistant." }
];

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});

function sendHomePage(req, res){
    res.sendFile(__dirname + '/public/home.html');
}

async function processUserPrompt(req, res) {
  const prompt = req.body.prompt;
  appendUserMessage(prompt);

  try {
    let reply = await getChatCompletion();
    appendAssistantMessage(reply);

    appendUserMessage(string1);  // Append string1 after the first completion
    reply = await getChatCompletion();
    appendAssistantMessage(reply);

    // Send the whole conversation back to the client
    res.json({ response: reply, messages: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while generating a response.' });
  }
}

async function autoConversation(req, res) {
  console.log("auto conversation started")
  try {
    for(let i = 0; i < 6; i++) {
      console.log("loop: " + i);
      appendUserMessage(string2);
      let reply2 = await getChatCompletion();
      appendAssistantMessage(reply2);
      console.log(reply2);

      appendUserMessage(string3);
      let reply3 = await getChatCompletion();
      console.log(reply3);
      appendAssistantMessage(reply3);
    }

    res.json({ messages: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while generating a response.' });
  }
  console.log("auto conversation completed")
}

function appendUserMessage(prompt) {
  messages.push({ "role": "user", "content": prompt });
}

function appendAssistantMessage(reply) {
  messages.push({ "role": "assistant", "content": reply });
}

async function getChatCompletion() {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: messages,
  });

  return completion.data.choices[0].message.content;
}
