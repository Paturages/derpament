<script>
  import ScoreRow from '../molecules/ScoreRow.svelte';

  export let players;
  export let scores;
  export let bans;
  export let pickCount;
  export let matchCount;
  export let filter;
  let groupScores = true;
  let displayScores = true;

  const playerScores = {};
  const rankedPlayers = [];
  let average = 0;
  scores.forEach(score => {
    // Ignore scores from non-tournament players
    if (!players[score.userId]) return;
    // The scores are already sorted beforehand,
    // so the pushed player scores should also end up sorted
    if (!playerScores[score.userId]) {
      playerScores[score.userId] = [];
      rankedPlayers.push({
        player: players[score.userId],
        // This is the reference to the array,
        // so we can just keep using the map to look for players below.
        scores: playerScores[score.userId]
      });
    }
    average += score.score;
    playerScores[score.userId].push(score);
  });
  average /= scores.length;

  // Group bans
  const groupedBans = {};
  if (bans) {
    bans.forEach(playerId => {
      if (!players[playerId]) return;
      if (!groupedBans[playerId]) groupedBans[playerId] = 0;
      ++groupedBans[playerId];
    });
  }

  function handleGroup() {
    groupScores = !groupScores;
  }

  function handleToggle() {
    displayScores = !displayScores;
  }
</script>

<div class="root">
  <div class="stats">
    <div class="average">
      Average score: <b>{average ? average.toFixed(0) : 'N/A'}</b>
    </div>
    {#if bans}
      <div class="picks">
        Picked <b>{pickCount}/{matchCount}</b> ({(100 * pickCount / matchCount).toFixed(2)}%) times
      </div>
      <div class="bans">
        Banned <b>{bans.length}/{matchCount}</b>
        ({(100 * bans.length / matchCount).toFixed(2)}%)
        times{#if bans.length}{' by:'}{/if}
        {#each Object.keys(groupedBans) as playerId, i}
          {#if i},{/if}
          <span class={filter && players[playerId].name.toLowerCase().includes(filter.toLowerCase()) && 'ban-highlighted'}>{
            players[playerId].name
            + (groupedBans[playerId] > 1 ? ` (${groupedBans[playerId]}x)` : '')
          }</span>
        {/each}
      </div>
      <div class="relevancy">
        Relevancy: <b>{bans.length + pickCount}/{matchCount}</b> ({(100 * (bans.length + pickCount) / matchCount).toFixed(2)}%)
      </div>
    {/if}
  </div>
  <button on:click={handleToggle}>{displayScores ? 'Hide' : 'Show'} scores</button>
  <button on:click={handleGroup}>{groupScores ? 'Show all player scores' : 'Only best scores'}</button>
  {#if displayScores}
    <div class="scores">
      {#if groupScores}
        {#each rankedPlayers as { player, scores }, i}
          {#if !filter || player.name.toLowerCase().includes(filter.toLowerCase())}
            <ScoreRow index={i+1} player={player} {...scores[0]} />
          {/if}
        {/each}
      {:else}
        {#each scores as score, i}
          {#if players[score.userId]
            && (!filter || players[score.userId].name.toLowerCase().includes(filter.toLowerCase()))
          }
            <ScoreRow index={i+1} player={players[score.userId]} {...score} />
          {/if}
        {/each}
      {/if}
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
  .ban-highlighted {
    text-decoration: underline;
    color: #ffb300;
    font-weight: bold;
  }
</style>