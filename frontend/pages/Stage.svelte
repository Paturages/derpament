<script>
  import { onMount } from 'svelte';
  import { tournament, stage } from '../stores';
  import ScoreList from '../components/organisms/ScoreList.svelte';
  import MapCard from '../components/molecules/MapCard.svelte';

  export let id;
  export let tournamentId;

  onMount(async () => {
    if (!$tournament || $tournament.id != tournamentId) {
      try {
        tournament.set(null);
        stage.set(null);
        const res1 = await fetch(`data/${tournamentId}.json`);
        tournament.set(await res1.json());
        const res2 = await fetch(`data/${tournamentId}.${id}.json`);
        stage.set(await res2.json());
      } catch {
        location.hash = '';
      }
    }
    if (!$stage || $stage.id != id) {
      try {
        stage.set(null);
        const res = await fetch(`data/${tournamentId}.${id}.json`);
        stage.set(await res.json());
      } catch {
        location.hash = `#/tournaments/${tournamentId}`;
      }
    }
  });
</script>

<main>
  {#if $stage}
    <a href={`#/tournaments/${tournamentId}`}>&lt;&nbsp;Back</a>
    <h1>{$stage.name}</h1>
    <h2>{$stage.maps.length} maps</h2>
    <div class="maps">
      {#each $stage.maps as map (map.beatmapId)}
        <div class="map">
          <MapCard {...map} />
          <ScoreList players={$tournament.players} scores={map.scores} />
        </div>
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
  .map {
    margin: 1em 0 3em;
  }
  .map > :global(*) {
    margin: 1em 0;
  }
</style>