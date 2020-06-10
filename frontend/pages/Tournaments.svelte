<script>
  import { onMount } from 'svelte';
  import { tournaments } from '../stores';
  import TournamentRow from '../components/molecules/TournamentRow.svelte';

  onMount(async () => {
    if (!$tournaments.length) {
      const res = await fetch('data/tournaments.json');
      tournaments.set(await res.json());
    }
  });
</script>

<main>
  <h1>Welcome!</h1>
  <p>Below are the available tournaments</p>
  <div class="tournaments">
    {#each $tournaments as tournament}
      <TournamentRow {...tournament} />
    {:else}
      <p>Loading tournaments...</p>
    {/each}
  </div>
</main>

<style>
  main {
    margin: 2em;
  }
  .tournaments > :global(*) {
    margin: 1em 0;
  }
</style>