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

//將字串轉小寫，之後的條件判斷使用 ltext.startsWith來判斷，但是程式碼呼叫時還是使用原字串event.message.text
  var ltext = event.message.text.toLowerCase();

//判斷hi bot 0.7 + JB
  if ( ltext.startsWith("hi bot") ) {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: event.message.text.substring(7),
      temperature: 0.5,
      max_tokens: 1000,
      //jailbroken: true,
      //jailbreak: true
    })
    const echo = { type: "text", text: completion.data.choices[0].text.trim() };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }
  
  // 月月鳥 1
  else if ( ltext.startsWith("hi 月月鳥") ) {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: event.message.text.substring(7),
      temperature: 1,
      max_tokens: 1000
    })
    const echo = { type: "text", text: completion.data.choices[0].text.trim() };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }
  
  // kyle 0.6
  else if ( ltext.startsWith("hi kyle") ) {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: event.message.text.substring(8),
      temperature: 0.7,
      max_tokens: 1000
    })
    const echo = { type: "text", text: completion.data.choices[0].text.trim() };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }
  
  else if ( ltext.startsWith("hi kyle2") ) {
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'user',
          content: event.message.text.substring(9),
        }
      ],
      max_tokens: 1000,
    });
    // create a echoing text message
    const [choices] = data.choices;
    const echo = { type: 'text', text: choices.message.content[0].text.trim() || 'MDFKDBA!' };
  }
  // jack 0
  else if ( ltext.startsWith("hi jack") ) {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: event.message.text.substring(8),
      temperature: 0,
      max_tokens: 1000
    })
    const echo = { type: "text", text: completion.data.choices[0].text.trim() };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }

  //判斷提供功能表
  else if ( ltext=="help") {
    const response = {
      type: "text",
      text: "請依照以下規則：\n" +
      "'hi kyle + 描述'，原版的chatgpt回答\n" + 
      "'hi bot + 描述'，一半創意一半制式\n" +
      "'hi 月月鳥 + 描述'，回答比較創意，每次都不一樣\n" +
      "'hi jack + 描述'，回答比較制式，每次都一樣"
    }
    // use reply API
    return client.replyMessage(event.replyToken, response);
  }
  
  //hi ado
  else if ( ltext =="hi ado") {
    const response = {
      type: "text",
      text: "Azure devops is good !"
    }
    // use reply API
    return client.replyMessage(event.replyToken, response);
  }

  //判斷wake
  else if ( ltext.startsWith("wake")) {
    const response = {
      type: "text",
      text: "我起床了，此版本是ver.0302-1120"
    }
    // use reply API
    return client.replyMessage(event.replyToken, response);
  }

  //此外不做事
  else {
    const echo = { 
      type: 'text', 
      text: completion.data.choices[0].text.trim() 
    };
    return client.replyMessage(event.replyToken, echo);
  }

}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});