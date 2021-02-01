<script>
  import { onMount } from 'svelte';
  import { tournament } from '../stores';
  import Header from '../components/organisms/Header.svelte';
  import PlayerList from '../components/organisms/PlayerList.svelte';
  import StageRow from '../components/molecules/StageRow.svelte';

  export let id;
  export let query;
  let playerValues;
  let displayPlayers;
  let loading = true;

  function handleSearch(event) {
    const text = event.detail;
    if (!text) displayPlayers = playerValues;
    else {
      let [, country] = text.match(/country=(.*)/i) || [];
      if (country) {
        displayPlayers = playerValues.filter(
          player => player.country.toLowerCase().includes(country.toLowerCase())
        );
      } else {
        displayPlayers = playerValues.filter(
          player => player.name.toLowerCase().includes(text.toLowerCase())
        );
      }
    }
  }

  onMount(async () => {
    if (!$tournament || $tournament.id != id) {
      try {
        tournament.set(null);
        const res = await fetch(`data/${id}.json`);
        tournament.set(await res.json());
      } catch {
        location.hash = '';
      }
    }
    playerValues = Object.values($tournament.players);
    displayPlayers = playerValues;
    if (query) handleSearch(query);
    loading = false;
  });
</script>

<main>
  {#if !loading}
    <Header backHref="#/" on:search={handleSearch} />
    <h1>{$tournament.name}</h1>
    <h2>{$tournament.stages.length} stages</h2>
    <div class="stages">
      {#each $tournament.stages as stage}
        <StageRow {...stage} href={`#/tournaments/${id}/stages/${stage.id}`} />
      {/each}
    </div>
    <h2>{Object.keys($tournament.players).length} players</h2>
    <div class="players">
      <PlayerList players={displayPlayers} />
    </div>
  {:else}
    <p>Loading tournament data...</p>
  {/if}
</main>

<style>
  main {
    padding-top: 1em;
    margin: 2em;
  }
  .stages {
    margin-bottom: 2em;
  }
  .stages > :global(*) {
    margin: 1em 0;
  }
</style>