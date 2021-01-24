require("dotenv").config();
const fs = require("fs");
const path = require("path");
const got = require("got");

const { CLIENT_ID, CLIENT_SECRET } = process.env;

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
    const token = await got.post(`https://osu.ppy.sh/oauth/token`, {
      json: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "public"
      },
      responseType: "json",
    });
    fs.writeFileSync(
      path.resolve(__dirname, "..", "auth.json"),
      JSON.stringify(token.body)
    );
    return token.body;
  }
};

exports.getToken = () => {
  if (!auth) return null;
  return auth.access_token;
};
