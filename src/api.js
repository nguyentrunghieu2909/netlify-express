const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

// router.get("/", (req, res) => {
//   res.json({
//     hello: "hi!"
//   });
// });

// router.get("/test", (req, res) => {
//   res.json({
//     hello: "hi there!"
//   });
// });

router.get("/webhook", (req, res) => {
  if (req.query['hub.verify_token'] === mylovelylady299) {
      res.send(req.query['hub.challenge']);
  } else {
      res.send('Invalid verify token');
  }
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
