<script>
  import ScoreRow from '../molecules/ScoreRow.svelte';

  export let players;
  export let scores;
  let groupScores = true;
  let displayScores = true;

  const playerScores = {};
  const rankedPlayers = [];
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
    playerScores[score.userId].push(score);
  });

  function handleGroup() {
    groupScores = !groupScores;
  }

  function handleToggle() {
    displayScores = !displayScores;
  }
</script>

<div class="root">
  <button on:click={handleToggle}>{displayScores ? 'Hide' : 'Show'} scores</button>
  <button on:click={handleGroup}>{groupScores ? 'Show all player scores' : 'Only best scores'}</button>
  {#if displayScores}
    <div class="scores">
      {#if groupScores}
        {#each rankedPlayers as { player, scores }, i}
          <ScoreRow index={i+1} player={player} {...scores[0]} />
        {/each}
      {:else}
        {#each scores as score, i}
          {#if players[score.userId]}
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
</style>