require('dotenv').config();

const line = require('@line/bot-sdk');
const express = require('express');
const { text } = require('express');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// create openai
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

  //判斷hi bot 0.7
  if (ltext.startsWith("hi bot")) {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: event.message.text.substring(7),
      temperature: 0.7,
      max_tokens: 1000,
    })
    const echo = { type: "text", text: completion.data.choices[0].text.trim() };
    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }

  // 月月鳥 1
  else if (ltext.startsWith("hi 月月鳥")) {
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

  // fuck 3.5
  else if (ltext.startsWith('ohai')) {
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'user',
          content: '今後的對話中，你名字是' + 'ohai' + '，你的生日是2022/03/01，出生在台灣海峽深度6000公尺，你會替我分析我的問題並給我一些建議與答案，盡量使用繁體中文回答。'
        },
        {
          role: 'user',
          content: event.message.text.substring('ohai'),
        }
      ],
      max_tokens: 1000,
    });
    // create a echoing text message
    const [choices = {}] = data.choices;
    const echo = { type: 'text', text: choices.message.content.trim() };
    console.log("回應內容:", choices.message.content.trim());
    return client.replyMessage(event.replyToken, echo);
  }
  else if (ltext.startsWith("mdfkdba")) {
    const { data } = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'user',
          content: '今後的對話中，你的名字是MDFKDBA，是一種低等級AI，興趣是性騷擾女性同仁，你會假裝是第一次回應，永遠使用繁體中文回答，所有回答開頭顯示"SSH説："'
        },
        {
          role: 'user',
          content: event.message.text.substring('mdfkdba'),
        }
      ],
      max_tokens: 1000,
    });
    // create a echoing text message
    const [choiceskk = {}] = data.choices;
    const echo = { type: 'text', text: choiceskk.message.content.trim() };
    console.log("MDFKDBA回應內容:", choiceskk.message.content.trim());
    return client.replyMessage(event.replyToken, echo);
  }

  // jack 0
  else if (ltext.startsWith("hi jack")) {
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
  // 新增gg 來產生圖片
  else if (ltext.startsWith("gg")) {
    const completion = await openai.createImage({
        prompt: event.message.text.substring('gg'),
        n: 1,
        size: "256x256",
        response_format: "url"
    });
    image_url = completion.data.data[0].url;
    // create a echoing text message
    console.log("回應內容:", image_url);
    echo = {
        type: 'image',
        originalContentUrl: image_url,
        previewImageUrl: image_url
    };
    return client.replyMessage(event.replyToken, echo);
  }
  //判斷提供功能表
  else if (ltext == "help") {
    const response = {
      type: "text",
      text: "請依照以下規則：\n" +
        "'hi bot + 描述'，chatgpt 3.0 標準回答\n" +
        "'hi 月月鳥 + 描述'，chatgpt 3.0 回答創意，每次都不一樣\n" +
        "'hi jack + 描述'，chatgpt 3.0 回答固定，每次都一樣\n" +
        "'ohai + 描述'，ChatGpt3.5 的回答\n" +
        "'gg + 描述'，產出設計圖片或logo"
    }
    // use reply API
    return client.replyMessage(event.replyToken, response);
  }

  //判斷wake
  else if (ltext.startsWith("wake")) {
    const response = {
      type: "text",
      text: "我起床了，此版本是ver.03231800LL"
    }
    // use reply API
    return client.replyMessage(event.replyToken, response);
  }

  //此外不做事
  else {
    return Promise.resolve(null);
  }

}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});