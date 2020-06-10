require("dotenv").config();
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

if (!process.argv[2] || !process.argv[3]) {
  console.log("Usage: node scripts/maps [folder_name] [stage_id]");
  process.exit(1);
}

const inputPath = path.resolve(__dirname, "..", "inputs", process.argv[2]);
const generatedPath = path.resolve(__dirname, "..", "generated");

const matchLineWithField = (line, field, cb) => {
  if (line.startsWith(field + ":")) {
    cb(line.slice(field.length + 1));
    return true;
  }
};

(async () => {
  const stages = await fs.promises.readdir(path.resolve(inputPath, "maps"));
  const folderName = stages.find((s) => s.split(".")[0] === process.argv[3]);

  if (!folderName) {
    console.log(`Stage ${process.argv[3]} not found`);
    process.exit(1);
  }

  const mapFileNames = await fs.promises.readdir(
    path.resolve(inputPath, "maps", folderName)
  );

  for (const mapFileName of mapFileNames) {
    const [, category] = mapFileName.split(".");
    console.log(`Computing ${category.toUpperCase()}...`);

    const map = await fs.promises.readFile(
      path.resolve(inputPath, "maps", folderName, mapFileName),
      { encoding: "utf8" }
    );
    const lines = map.split(/\r?\n/);
    const data = {
      category,
      counts: {
        bpm: 0,
        sv: 0,
        notes: {
          total: 0,
          rice: 0,
          ln: 0,
          single: 0,
          jump: 0,
          hand: 0,
          quad: 0,
        },
      },
    };
    const notes = {};

    let tag;
    let maxTime;
    lines.forEach((line) => {
      // Song metadata
      if (matchLineWithField(line, "Title", (x) => (data.title = x))) return;
      if (matchLineWithField(line, "Artist", (x) => (data.artist = x))) return;
      if (matchLineWithField(line, "Creator", (x) => (data.mapper = x))) return;
      if (matchLineWithField(line, "Version", (x) => (data.difficulty = x)))
        return;

      // Map metadata
      if (matchLineWithField(line, "BeatmapID", (x) => (data.beatmapId = x)))
        return;
      if (
        matchLineWithField(line, "BeatmapSetID", (x) => (data.beatmapSetId = x))
      )
        return;
      if (matchLineWithField(line, "HPDrainRate", (x) => (data.hp = x))) return;
      if (matchLineWithField(line, "OverallDifficulty", (x) => (data.od = x)))
        return;

      // Computed map data
      if (line === "[TimingPoints]") return (tag = "timing");
      if (line === "[HitObjects]") return (tag = "notes");

      if (tag === "timing") {
        const [, value, somethingElse] = line.split(",");
        if (!somethingElse) return;
        // value > 0 is a BPM marker, value < 0 is an SV marker
        if (+value > 0) data.counts.bpm += 1;
        else data.counts.sv += +1;
      } else if (tag === "notes") {
        const [note, , time, type, , info] = line.split(",");
        if (!info) return;
        if (+time > maxTime) {
          maxTime = +time;
        }

        data.counts.notes.total += 1;
        if (type === "128") {
          data.counts.notes.ln += 1;
        } else {
          data.counts.notes.rice += 1;
        }

        if (!notes[time]) notes[time] = [];
        notes[time].push({
          note: {
            64: 1,
            192: 2,
            320: 3,
            448: 4,
          }[note],
          type: type === "128" ? "ln" : "rice",
          length: type === "128" ? +info.split(":")[0] : 0,
        });
      }
    });

    Object.values(notes).forEach((group) => {
      switch (group.length) {
        case 1:
          return (data.counts.notes.single += 1);
        case 2:
          return (data.counts.notes.jump += 1);
        case 3:
          return (data.counts.notes.hand += 1);
        case 4:
          return (data.counts.notes.quad += 1);
      }
    });

    data.length = maxTime;

    await fs.promises.writeFile(
      path.resolve(generatedPath, "maps", `${data.beatmapId}.json`),
      prettier.format(JSON.stringify(data), { parser: "json" })
    );
    console.log(
      `${category.toUpperCase()} "${data.artist} - ${
        data.title
      }" has been computed and saved!`
    );
  }
})();
