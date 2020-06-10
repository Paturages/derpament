<script>
  import { onMount } from 'svelte';
  import { tournament } from '../stores';
  import StageRow from '../components/molecules/StageRow.svelte';
  import PlayerRow from '../components/molecules/PlayerRow.svelte';

  export let id;

  onMount(async () => {
    if (!$tournament || $tournament.id != id) {
      try {
        const res = await fetch(`data/${id}.json`);
        tournament.set(await res.json());
      } catch {
        location.hash = '';
      }
    }
  });
</script>

<main>
  {#if $tournament}
    <a href="#/">&lt;&nbsp;Back</a>
    <h1>{$tournament.name}</h1>
    <h2>{$tournament.stages.length} stages</h2>
    <div class="stages">
      {#each $tournament.stages as stage}
        <StageRow {...stage} href={`#/tournaments/${id}/stages/${stage.id}`} />
      {/each}
    </div>
    <h2>{Object.keys($tournament.players).length} players</h2>
    <div class="players">
      {#each Object.values($tournament.players) as player}
        <PlayerRow {...player} />
      {/each}
    </div>
  {:else}
    <p>Loading tournament data...</p>
  {/if}
</main>

<style>
  main {
    margin: 2em;
  }
  .stages {
    margin-bottom: 2em;
  }
  .stages > :global(*) {
    margin: 1em 0;
  }
</style>