<script>
  import QualifiersRow from '../molecules/QualifiersRow.svelte';

  export let players;
  export let maps;
  export let filter;
  let displayScores = true;

  const playerScores = {};
  const rankedPlayersPerMap = {};
  let average = 0;
  let nbScores = 0;
  maps.forEach(map => {
    rankedPlayersPerMap[map.beatmapId] = [];
    // Compile player ranks and total scores
    map.scores.forEach(score => {
      // Ignore scores from non-tournament players
      if (!players[score.userId]) return;
      // The scores are already sorted beforehand,
      // so the pushed player scores should also end up sorted for the map
      if (!playerScores[score.userId]) {
        playerScores[score.userId] = {
          player: players[score.userId],
          totalScore: 0,
          scores: []
        };
      }
      if (!rankedPlayersPerMap[map.beatmapId].includes(score.userId)) {
        rankedPlayersPerMap[map.beatmapId].push(score.userId);
        playerScores[score.userId].totalScore += score.score;
      }
      average += score.score;
      playerScores[score.userId].scores.push(score);
    });
    nbScores += map.scores.length;
  });
  average /= nbScores;

  // Tally ranks per map
  Object.keys(playerScores).forEach(userId => {
    playerScores[userId].ranks = [];
    playerScores[userId].totalRank = 0;
    // If a rank 0 is detected, remove the player from the seeding,
    // as their qualifiers is incomplete and therefore invalid
    let hasEmpty = false;
    maps.forEach(map => {
      if (hasEmpty) return;
      const rank = rankedPlayersPerMap[map.beatmapId].indexOf(userId) + 1;
      if (!rank) hasEmpty = true;
      playerScores[userId].ranks.push(rank);
      playerScores[userId].totalRank += rank;
    });
    if (hasEmpty) delete playerScores[userId];
  });

  const rankedPlayers = Object.values(playerScores)
    .sort((a, b) => {
      if (a.totalRank == b.totalRank) {
        return a.totalScore < b.totalScore ? 1 : -1;
      };
      return a.totalRank < b.totalRank ? -1 : 1;
    });

  function handleToggle() {
    displayScores = !displayScores;
  }

  function rowMatchesFilter(row, filter) {
    if (!filter) return true;
    let [, country] = filter.match(/country=(.*)/i) || [];
    if (country) return row.player.country.toLowerCase().includes(country.toLowerCase());
    return row.player.name.toLowerCase().includes(filter.toLowerCase());
  }
</script>

<div class="root">
  <div class="stats">
    <div class="average">
      Average score: <b>{average ? average.toFixed(0) : 'N/A'}</b>
    </div>
  </div>
  <button on:click={handleToggle}>{displayScores ? 'Hide' : 'Show'} scores</button>
  {#if displayScores}
    <div class="scores">
      {#each rankedPlayers as row, i}
        {#if rowMatchesFilter(row, filter)}
          <QualifiersRow index={i+1} {...row} />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .scores {
    margin-top: .5em;
  }
  .stats {
    margin-bottom: 1em;
  }
</style>