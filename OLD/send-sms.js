// Sends SMS from VIRTUAL_NUMBER -> TO_NUMBER (my cell)
require("dotenv").config({ path: __dirname + "/.env" });

const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const VONAGE_APPLICATION_ID = process.env.VONAGE_APPLICATION_ID;
const VONAGE_APPLICATION_PRIVATE_KEY_PATH =
  process.env.VONAGE_APPLICATION_PRIVATE_KEY_PATH;

const TO_NUMBER = process.env.TO_NUMBER;
const VIRTUAL_NUMBER = process.env.VIRTUAL_NUMBER;

const Vonage = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: VONAGE_API_KEY,
  apiSecret: VONAGE_API_SECRET,
  applicationId: VONAGE_APPLICATION_ID,
  privateKey: VONAGE_APPLICATION_PRIVATE_KEY_PATH,
});

vonage.channel.send(
  { type: "sms", number: "15754947093" },
  { type: "sms", number: "12018994297" },
  {
    content: {
      type: "text",
      text: "This is an SMS text message sent using the Messages API",
    },
  },
  (err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.log(data.message_uuid);
    }
  }
);
