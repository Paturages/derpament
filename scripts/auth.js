require("dotenv").config();
const rl = require("readline");
const fs = require("fs");
const path = require("path");
const got = require("got");

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

let auth;

exports.initAuth = async () => {
  try {
    auth = require("../auth.json");
    // Verify that the token is still valid
    await got("https://osu.ppy.sh/api/v2/me", {
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
      },
    });
  } catch {
    console.log("Log into your osu! account using this link:");
    console.log(
      `https://osu.ppy.sh/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=public`
    );

    const readline = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const auth = await new Promise((resolve, reject) =>
      readline.question("and enter the code below:", async (code) => {
        readline.close();
        try {
          const token = await got.post(`https://osu.ppy.sh/oauth/token`, {
            json: {
              code,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              grant_type: "authorization_code",
              redirect_uri: REDIRECT_URI,
            },
            responseType: "json",
          });
          fs.writeFileSync(
            path.resolve(__dirname, "..", "auth.json"),
            JSON.stringify(token.body)
          );
          resolve(token.body);
        } catch (err) {
          reject(err);
        }
      })
    );
  }
};

exports.getToken = () => {
  if (!auth) return null;
  return auth.access_token;
};
