<script>
  import PlayerRow from '../molecules/PlayerRow.svelte';

  export let players;
  export let sort = 'rank';
  let sortedPlayers;

  $: {
    if (sort === 'rank') {
      sortedPlayers = sortByRank(players);
    } else {
      sortedPlayers = sortByAlphabetical(players);
    }
  }

  const sortByAlphabetical = players => players.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
  const sortByRank = players => players.sort((a, b) => a.rank < b.rank ? -1 : 1);

  function handleAlphabeticalSort() {
    sortedPlayers = sortByAlphabetical(players);
  }

  function handleRankSort() {
    sortedPlayers = sortByRank(players);
  }
</script>

<div class="root">
  <button on:click={handleAlphabeticalSort}>Alphabetical</button>
  <button on:click={handleRankSort}>Rank</button>
  <div class="players">
    {#each sortedPlayers as player}
      <PlayerRow {...player} />
    {/each}
  </div>
</div>

<style>
  .players > :global(*) {
    margin: .5em 0;
  }
</style>