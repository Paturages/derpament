# derpament

A collection of scripts to fetch data and generate statistics for osu! tournaments.

## Installation

Download [NodeJS](https://nodejs.org/en/download/) if you don't have it.

Clone/download this repository, install the dependencies through `npm install` from command line at the root of this project.

Create a `.env` file from the `.env.example` template. Generate the relevant osu! credentials and fill them in.
For the v2 redirect URL, you can put whatever.

## Usage

First, create a folder in `inputs` to initialize your tournament. Inside that folder, create `maps` and `matches` folders,
and create a `meta.json` and `players.txt` file.

The scripts are ran by the following commands, assuming you have a command line at the root of this project.

```
node scripts/players [refresh]
```

This requires you to fill in `players.txt` with the list of tournament participants' IDs, separated by line breaks.

This will fetch data from the specified players' profiles and save them in `generated/players`.
The selected mode ("mania") is hardcoded in the script, so if you wanna change it, it's there.

This requires authenticating on osu! OAuth. After logging in, you'll have to copy the `code` from the URL after authenticating
and paste it in the command line.

You can specify the string "refresh" as an extra argument to refresh the list of players: by default, if a generated player JSON
already exists, it doesn't fetch it again.

```
node scripts/matches <folder_name> <stage_id> [refresh]
```

This requires you to create a stage file inside the `matches` folder of your tournament (e.g. `1.qualifiers.txt`).
The prefix number is your `stage_id`.

This will fetch the match information from a given list of match IDs, separated by line breaks, and will save it in `generated/matches`.

You can specify the string "refresh" as an extra argument to refresh the list of matches: by default, if a generated match JSON
already exists, it doesn't fetch it again.

```
node scripts/maps <folder_name> <stage_id>
```

This requires you to create a stage folder inside the `maps` folder of your tournament (e.g. `1.qualifiers`).
The prefix number is your `stage_id`.

Inside that folder, you'll have to copy and paste the `.osu` files of your corresponding mappool and rename them to their respective category (SV, LN...).
Order them by prefixing them by a number (e.g `01.sv1.osu`).

This will compute useful information about the provided maps and save it as JSON in `generated/maps`.

## License

This is MIT so if you wanna fork this and use it for your own tournaments and host your own GitHub Pages, it's free real estate.
