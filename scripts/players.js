require("dotenv").config();
const fs = require("fs");
const path = require("path");
const got = require("got");
const prettier = require("prettier");

const { initAuth, getToken } = require("./auth");

if (!process.argv[2]) {
  console.log("Usage: node scripts/players [folder_name]");
  console.log("Specify 'refresh' as an extra argument to recompute players");
  process.exit(1);
}

const mode = "mania";
const inputPath = path.resolve(__dirname, "..", "inputs", process.argv[2]);
const generatedPath = path.resolve(__dirname, "..", "generated");

(async () => {
  await initAuth();
  const token = getToken();

  const playerIds = (
    await fs.promises.readFile(path.resolve(inputPath, "players.txt"), {
      encoding: "utf8",
    })
  ).split(/\r?\n/);

  for (const playerId of playerIds) {
    try {
      const player = require(`../generated/players/${playerId}.json`);
      if (process.argv[3] !== "refresh") {
        console.log(
          `ID ${player.id} ${player.username} already exists, skipping...`
        );
        continue;
      }
    } catch {
      // does not exist yet and not a refresh request, proceed
    }

    console.log(`Fetching user ID ${playerId}...`);
    const { body } = await got(
      `https://osu.ppy.sh/api/v2/users/${playerId}/${mode}`,
      {
        responseType: "json",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await fs.promises.writeFile(
      path.resolve(generatedPath, "players", `${playerId}.json`),
      prettier.format(JSON.stringify(body), { parser: "json" })
    );
    console.log(`ID ${id} ${username} has been fetched and saved!`);

    // Wait 2 seconds before the next request to not contribute to the murder of the osu! infrastructure
    await new Promise((r) => setTimeout(r, 2000));
  }
})();
