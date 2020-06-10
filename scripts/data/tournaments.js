const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const inputPath = path.resolve(__dirname, "..", "..", "inputs");
const docsDataPath = path.resolve(__dirname, "..", "..", "docs", "data");

(async () => {
  const tournaments = [];
  const tournamentFolders = await fs.promises.readdir(inputPath);
  for (const tournamentFolder of tournamentFolders) {
    try {
      // Tournament metadata
      const tournament = require(`${inputPath}/${tournamentFolder}/meta.json`);
      tournament.id = tournamentFolder;
      // Amount of players
      tournament.playersCount = (
        await fs.promises.readFile(
          path.resolve(inputPath, tournamentFolder, "players.txt"),
          { encoding: "utf8" }
        )
      ).split(/\r?\n/).length;
      tournaments.push(tournament);
    } catch (err) {
      console.warn(err.message);
    }
  }
  await fs.promises.writeFile(
    path.resolve(docsDataPath, "tournaments.json"),
    prettier.format(JSON.stringify(tournaments), { parser: "json" })
  );
  console.log("Computed", tournaments.length, "tournaments");
})();
