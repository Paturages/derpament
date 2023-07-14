require("dotenv").config();
const fs = require("fs");
const path = require("path");
const got = require("got");
const prettier = require("prettier");

if (!process.argv[2] || !process.argv[3]) {
  console.log("Usage: node scripts/matches [folder_name] [stage_id]");
  console.log("Specify 'refresh' as an extra argument to recompute matches");
  process.exit(1);
}

const inputPath = path.resolve(__dirname, "..", "inputs", process.argv[2]);
const generatedPath = path.resolve(__dirname, "..", "generated");

(async () => {
  const stages = await fs.promises.readdir(path.resolve(inputPath, "matches"));
  const fileName = stages.find((s) => s.split(".")[0] === process.argv[3]);

  if (!fileName) {
    console.log(`Stage ${process.argv[3]} not found`);
    process.exit(1);
  }

  const mpIds = (
    await fs.promises.readFile(path.resolve(inputPath, "matches", fileName), {
      encoding: "utf8",
    })
  ).split(/\r?\n/);

  for (const mpId of mpIds) {
    if (!mpId.trim()) continue;
    try {
      const data = require(`../generated/matches/${mpId}.json`);
      if (process.argv[4] !== "refresh") {
        console.log(
          `ID ${mpId} ${data.match.name} already exists, skipping...`
        );
        continue;
      }
    } catch {
      // does not exist yet and not a refresh request, proceed
    }

    console.log(`Fetching match ID ${mpId}...`);
    const { body } = await got(`https://osu.ppy.sh/api/get_match`, {
      responseType: "json",
      searchParams: {
        k: process.env.V1_API_KEY,
        mp: mpId,
      },
    });

    await fs.promises.writeFile(
      path.resolve(generatedPath, "matches", `${mpId}.json`),
      prettier.format(JSON.stringify(body), { parser: "json" })
    );
    console.log(`ID ${mpId} "${body.match.name}" has been fetched and saved!`);

    // Wait 2 seconds before the next request to not contribute to the murder of the osu! infrastructure
    await new Promise((r) => setTimeout(r, 2000));
  }
})();
