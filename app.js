require('dotenv').config();

const line = require('@line/bot-sdk');
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

// create openai
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

//判斷hi kyle
  if (event.message.text.startsWith("hi kyle") || event.message.text.startsWith("Hi Kyle") || event.message.text.startsWith("Hi kyle") || event.message.text.startsWith("hi Kyle") ) {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: event.message.text.substring(7),
      max_tokens: 500
    })
    const echo = { type: "text", text: completion.data.choices[0].text.trim() };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }

  //判斷提供功能表
  else if (event.message.text.startsWith("help")) {
    const response = {
      type: "text",
      text: "請輸入 'hi kyle + 描述' 發問或聊天"
    }
    // use reply API
    return client.replyMessage(event.replyToken, response);
  }

  //判斷提供功能表
  else if (event.message.text.startsWith("wake up")) {
    const response = {
      type: "text",
      text: "我起床了，請輸入 'hi kyle + 描述' 發問或聊天"
    }
    // use reply API
    return client.replyMessage(event.replyToken, response);
  }

  //此外不做事
  else {
    const echo = { type: 'text', text: completion.data.choices[0].text.trim() };
    return client.replyMessage(event.replyToken, echo);
  }

}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});