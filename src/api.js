require("dotenv").config();
const bodyParser = require("body-parser")
const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.get("/test", (req, res) => {
  res.json({
    hello: "hi there!"
  });
});

router.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.MY_VERIFY_FB_TOKEN;
  
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {

          // Responds with the challenge token from the request
          console.log('WEBHOOK_VERIFIED');
          res.status(200).send(challenge);

      } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          res.sendStatus(403);
      }
  }
});

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
      "recipient": {
          "id": sender_psid
      },
      "message": { "text": response }
  };

  // Send the HTTP request to the Messenger Platform
  request({
      "uri": "https://graph.facebook.com/v7.0/me/messages",
      "qs": { "access_token": process.env.FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
  }, (err, res, body) => {
      if (!err) {
          console.log('message sent!');
      } else {
          console.error("Unable to send message:" + err);
      }
  });
}

router.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {

          // Gets the body of the webhook event
          let webhook_event = entry.messaging[0];
          console.log(webhook_event);


          // Get the sender PSID
          let sender_psid = webhook_event.sender?.id;
          console.log('Sender PSID: ' + sender_psid);

          // Check if the event is a message or postback and
          // pass the event to the appropriate handler function
          // if (webhook_event.message) {
          //     handleMessage(sender_psid, webhook_event.message);
          // } else if (webhook_event.postback) {
          //     handlePostback(sender_psid, webhook_event.postback);
          // }

          // reply with the same message
          callSendAPI(sender_psid, webhook_event.message)
          // callSendAPI("6-Truqf3r1ww5kq0:Pruqus31rpogcb:0-Aruqzyf6nmj2q-RV=6:F=", "asd")
      });

      // Return a '200 OK' response to all events
      res.status(200).send('EVENT_RECEIVED');

  } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
  }
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
