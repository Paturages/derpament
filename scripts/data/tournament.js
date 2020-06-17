const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

if (!process.argv[2]) {
  console.log("Usage: node scripts/data/tournament [folder_name]");
  process.exit(1);
}

const readTxt = (path) => fs.promises.readFile(path, { encoding: "utf8" });
const tournamentId = process.argv[2];
const inputPath = path.resolve(__dirname, "..", "..", "inputs", tournamentId);
const generatedPath = path.resolve(__dirname, "..", "..", "generated");
const docsDataPath = path.resolve(__dirname, "..", "..", "docs", "data");

(async () => {
  const tournament = require(`${inputPath}/meta.json`);

  // Compute players
  const playerIds = (
    await readTxt(path.resolve(inputPath, "players.txt"))
  ).split(/\r?\n/);
  tournament.players = {};
  for (const playerId of playerIds) {
    const {
      avatar_url: avatar,
      country: { name: country },
      id,
      username: name,
      statistics: {
        pp,
        rank: { global: rank, country: countryRank },
      },
    } = require(`${generatedPath}/players/${playerId}.json`);
    tournament.players[playerId] = {
      id,
      name,
      avatar,
      country,
      pp,
      rank,
      countryRank,
    };
  }

  // Compute stages
  for (const stage of tournament.stages) {
    // 1. Group scores by beatmap ID
    const matchIds = (
      await readTxt(path.resolve(inputPath, "matches", `${stage.id}.txt`))
    ).split(/\r?\n/);
    const scores = {};
    const picks = {};

    for (const matchId of matchIds) {
      const { games } = require(`${generatedPath}/matches/${matchId}.json`);
      // Matches should pick a song only once, so we keep track of them
      const matchPicks = new Set();

      for (const game of games) {
        if (!scores[game.beatmap_id]) scores[game.beatmap_id] = [];
        if (!picks[game.beatmap_id]) picks[game.beatmap_id] = 0;
        if (!matchPicks.has(game.beatmap_id)) {
          matchPicks.add(game.beatmap_id);
          ++picks[game.beatmap_id];
        }

        for (const {
          user_id,
          score,
          maxcombo,
          countmiss,
          count50,
          count100,
          countkatu,
          count300,
          countgeki,
        } of game.scores) {
          scores[game.beatmap_id].push({
            userId: user_id,
            score: +score,
            combo: +maxcombo,
            counts: {
              miss: +countmiss,
              50: +count50,
              100: +count100,
              200: +countkatu,
              300: +count300,
              max: +countgeki,
            },
          });
        }
      }
    }

    // 2. Gather the beatmap IDs from the maps and get the metadata
    const maps = await Promise.all(
      (
        await fs.promises.readdir(path.resolve(inputPath, "maps", stage.id))
      ).map(async (mapFile) => {
        const lines = (
          await readTxt(path.resolve(inputPath, "maps", stage.id, mapFile))
        ).split(/\r?\n/);
        for (const line of lines) {
          if (!line.startsWith("BeatmapID:")) continue;
          const map = require(`${generatedPath}/maps/${
            line.split(":")[1]
          }.json`);
          if (!scores[map.beatmapId]) {
            map.scores = [];
            map.pickCount = 0;
          } else {
            map.scores = scores[map.beatmapId].sort((a, b) =>
              a.score < b.score ? 1 : -1
            );
            map.pickCount = picks[map.beatmapId];
          }
          return map;
        }
      })
    );
    stage.mapCount = maps.length;

    await fs.promises.writeFile(
      path.resolve(docsDataPath, `${tournamentId}.${stage.id}.json`),
      prettier.format(
        JSON.stringify({
          ...stage,
          maps,
        }),
        { parser: "json" }
      )
    );
  }

  await fs.promises.writeFile(
    path.resolve(docsDataPath, `${tournamentId}.json`),
    prettier.format(JSON.stringify(tournament), { parser: "json" })
  );

  console.log(
    "Computed",
    tournament.name,
    "with",
    tournament.stages.length,
    "stages"
  );
})();
