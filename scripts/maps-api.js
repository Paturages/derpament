require("dotenv").config();
const fs = require("fs");
const path = require("path");
const got = require("got");
const prettier = require("prettier");

const { initAuth, getToken } = require("./auth");

if (!process.argv[2]) {
  console.log("Usage: node scripts/maps-api [folder_name] [stage_id]");
  console.log("Specify 'refresh' as an extra argument to recompute maps");
  process.exit(1);
}

const inputPath = path.resolve(__dirname, "..", "inputs", process.argv[2]);
const generatedPath = path.resolve(__dirname, "..", "generated");

(async () => {
  await initAuth();
  const token = getToken();

  const stages = await fs.promises.readdir(path.resolve(inputPath, "maps"));
  const fileName = stages.find((s) => s.split(".")[0] === process.argv[3]);

  if (!fileName) {
    console.log(`Stage ${process.argv[3]} not found`);
    process.exit(1);
  }

  const entries = (
    await fs.promises.readFile(path.resolve(inputPath, "maps", fileName), {
      encoding: "utf8",
    })
  ).split(/\r?\n/);

  for (const entry of entries) {
    let body, payload;
    const [category, mapId] = entry.split(':');
    try {
      body = require(`../generated/maps/${mapId}.json`);
      if (process.argv[4] !== "refresh") {
        console.log(
          `ID ${map.id} "${map.title} [${map.difficulty}]" already exists, skipping...`
        );
        continue;
      }
    } catch {
      // does not exist yet and not a refresh request, proceed
    }

    console.log(`Fetching map ID ${mapId}...`);
    try {
      ({ body } = await got(
        `https://osu.ppy.sh/api/v2/beatmaps/${mapId}`,
        {
          responseType: "json",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ));
      payload = {
        category,
        counts: {
          bpm: -1,
          sv: -1,
          notes: {
            total: body.count_circles + body.count_sliders,
            rice: body.count_circles,
            ln: body.count_sliders,
            single: -1,
            jump: -1,
            hand: -1,
            quad: -1,
          },
        },
        title: body.beatmapset.title,
        artist: body.beatmapset.artist,
        mapper: body.beatmapset.creator,
        difficulty: body.version,
        beatmapId: mapId,
        beatmapSetId: String(body.beatmapset_id),
        hp: body.drain,
        od: body.accuracy,
      };
    } catch (err) {
      console.error(err.message);
      console.log(
        "Please manually patch",
        path.resolve(generatedPath, "maps", `${mapId}.json`)
      );
      payload = body || require("../generated/maps/0.json");
      payload.category = category;
      payload.beatmapId = mapId;
    }

    await fs.promises.writeFile(
      path.resolve(generatedPath, "maps", `${mapId}.json`),
      prettier.format(JSON.stringify(payload), { parser: "json" })
    );
    console.log(`ID ${payload.title} [${payload.difficulty}] has been fetched and saved!`);

    // Wait 2 seconds before the next request to not contribute to the murder of the osu! infrastructure
    await new Promise((r) => setTimeout(r, 2000));
  }
})();
