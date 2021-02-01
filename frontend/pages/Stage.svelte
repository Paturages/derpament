<script>
  import { onMount } from 'svelte';
  import { tournament, stage } from '../stores';
  import Header from '../components/organisms/Header.svelte';
  import RollList from '../components/organisms/RollList.svelte';
  import QualifiersList from '../components/organisms/QualifiersList.svelte';
  import ScoreList from '../components/organisms/ScoreList.svelte';
  import MapCard from '../components/molecules/MapCard.svelte';

  export let id;
  export let tournamentId;
  export let query;
  let loading = true;
  let filter = query || null;

  function handleSearch(event) {
    filter = event.detail;
    location.hash = location.hash.split('?')[0] + (filter ? `?q=${filter}` : '');
  }

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
    loading = false;
  });
</script>

<main>
  {#if !loading}
    <Header initialValue={query} backHref={`#/tournaments/${tournamentId}`} on:search={handleSearch} />
    <h1>{$stage.name}</h1>
    {#if $stage.rolls}
      <h2>Rolls</h2>
      <RollList
        rolls={$stage.rolls}
        players={$tournament.players}
        {filter}
      />
    {/if}
    {#if $stage.qualifiers}
      <h2>Seeding</h2>
      <QualifiersList
        players={$tournament.players}
        maps={$stage.maps}
        {filter}
      />
    {/if}
    <h2>{$stage.maps.length} maps</h2>
    <div class="maps">
      {#each $stage.maps as map (map.beatmapId)}
        <div class="map">
          <MapCard {...map} />
          <ScoreList
            players={$tournament.players}
            scores={map.scores}
            bans={map.bans}
            pickCount={map.pickCount}
            matchCount={$stage.matchCount}
            {filter}
          />
        </div>
      {/each}
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
  .map {
    margin: 1em 0 3em;
  }
  .map > :global(*) {
    margin: 1em 0;
  }
</style>