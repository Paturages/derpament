const fs = require("fs");
const path = require("path");

if (!process.argv[2] || !process.argv[3]) {
  console.log("Usage: node scripts/docs/top-by-map [folder_name] [stage_id]");
  process.exit(1);
}

const inputPath = path.resolve(
  __dirname,
  "..",
  "..",
  "inputs",
  process.argv[2]
);
const generatedPath = path.resolve(__dirname, "..", "..", "generated");
const docsPath = path.resolve(__dirname, "..", "..", "docs");

(async () => {
  const mapStages = await fs.promises.readdir(path.resolve(inputPath, "maps"));
  const mapsFolderName = mapStages.find(
    (s) => s.split(".")[0] === process.argv[3]
  );

  if (!mapsFolderName) {
    console.log(`Map stage ${process.argv[3]} not found`);
    process.exit(1);
  }

  const matchStages = await fs.promises.readdir(
    path.resolve(inputPath, "matches")
  );
  const matchesFileName = matchStages.find(
    (s) => s.split(".")[0] === process.argv[3]
  );

  if (!matchesFileName) {
    console.log(`Match stage ${process.argv[3]} not found`);
    process.exit(1);
  }

  const output = fs.createWriteStream(
    path.resolve(docsPath, `${process.argv[2]}.${mapsFolderName}.html`)
  );
  output.write(
    `<html><head><link rel="stylesheet" href="basic.css" /></head><body>`
  );

  // 1. Group scores by beatmap ID
  const mpIds = (
    await fs.promises.readFile(
      path.resolve(inputPath, "matches", matchesFileName),
      {
        encoding: "utf8",
      }
    )
  ).split(/\r?\n/);
  const scores = {};

  for (const mpId of mpIds) {
    const { games } = require(`${generatedPath}/matches/${mpId}.json`);
    for (const game of games) {
      if (!scores[game.beatmap_id]) scores[game.beatmap_id] = [];
      for (const score of game.scores) {
        scores[game.beatmap_id].push(score);
      }
    }
  }

  // 2. Gather the beatmap IDs from the maps, get the metadata and attach the lists
  const mapFileNames = await fs.promises.readdir(
    path.resolve(inputPath, "maps", mapsFolderName)
  );

  for (const mapFileName of mapFileNames) {
    const [, category] = mapFileName.split(".");
    console.log(`Computing ${category.toUpperCase()}...`);

    const map = await fs.promises.readFile(
      path.resolve(inputPath, "maps", mapsFolderName, mapFileName),
      { encoding: "utf8" }
    );
    const lines = map.split(/\r?\n/);
    let beatmapId;
    for (const line of lines) {
      if (!line.startsWith("BeatmapID:")) continue;
      beatmapId = line.split(":")[1];
      break;
    }

    const mapData = require(`${generatedPath}/maps/${beatmapId}.json`);
    output.write(`<p class="song">
      <h2>${mapData.category}</h2>
      <h3>${mapData.artist} - ${mapData.title}</h3>
      <h4>mapped by ${mapData.mapper}</h4>
      <h5>[${mapData.difficulty}]</h5>
      <p>
      ${mapData.counts.notes.total} notes
      (${mapData.counts.notes.rice} rice, ${mapData.counts.notes.ln} LNs)<br />
      ${mapData.counts.notes.single} singles,
      ${mapData.counts.notes.jump} jumps,
      ${mapData.counts.notes.hand} hands,
      ${mapData.counts.notes.quad} quads
      </p>
      <ol>
        ${(scores[beatmapId] || [])
          .sort((a, b) => {
            return +a.score < +b.score ? 1 : -1;
          })
          .map((score) => {
            try {
              const user = require(`${generatedPath}/players/${score.user_id}.json`);
              return `<li>
                <div class="player">
                  <b>${user.username}</b>
                </div>
                <details class="score">
                  <summary>${score.score}</summary>
                  <p>
                    <b>${score.countgeki}</b> 300g,
                    <b>${score.count300}</b> 300,
                    <b>${score.countkatu}</b> 200,
                    <b>${score.count100}</b> 100,
                    <b>${score.count50}</b> 50,
                    <b>${score.countmiss}</b> miss
                  </p>
                </details>
              </li>`;
            } catch {
              // The user doesn't belong to the tournament (e.g. referee)
              return "";
            }
          })
          .join("")}
      </ol>
    </p>`);
  }

  output.end("</body></html>");
})();
