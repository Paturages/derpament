<script>
  import ScoreRow from '../molecules/ScoreRow.svelte';

  export let players;
  export let scores;
  let displayScores = false;

  function handleToggle() {
    displayScores = !displayScores;
  }
</script>

<div class="root">
  <button on:click={handleToggle}>{displayScores ? 'Hide' : 'Show'} all scores</button>
  {#if displayScores}
    <div class="scores">
      {#each scores as score}
        {#if players[score.userId]}
          <ScoreRow player={players[score.userId]} {...score} />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .scores > :global(*) {
    margin: 1em 0;
  }
</style>