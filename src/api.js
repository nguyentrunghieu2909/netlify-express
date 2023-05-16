import chatBotController from "./controllers/chatBotController";
const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    hello: "hi there!"
  });
});

router.get("/webhook", chatBotController.getWebhook);
router.post("/webhook", chatBotController.postWebhook);

// router.get("/webhook", (req, res) => {
//   // Your verify token. Should be a random string.
//   let VERIFY_TOKEN = 'mylovelychatbot299';

//   // Parse the query params
//   let mode = req.query['hub.mode'];
//   let token = req.query['hub.verify_token'];
//   let challenge = req.query['hub.challenge'];

//   // Checks if a token and mode is in the query string of the request
//   if (mode && token) {

//       // Checks the mode and token sent is correct
//       if (mode === 'subscribe' && token === VERIFY_TOKEN) {

//           // Responds with the challenge token from the request
//           console.log('WEBHOOK_VERIFIED');
//           res.status(200).send(challenge);

//       } else {
//           // Responds with '403 Forbidden' if verify tokens do not match
//           res.sendStatus(403);
//       }
//   }
// });

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
