<script>
  import { onMount, onDestroy } from 'svelte';
  import Stage from './pages/Stage.svelte';
  import Tournament from './pages/Tournament.svelte';
  import Tournaments from './pages/Tournaments.svelte';

  let url;
  let tournamentId;
  let stageId;

  const onHashChange = () => {
    url = location.hash.slice(1) || '/';
    const [, p1, id1, p2, id2] = url.split('/');
    tournamentId = p1 === 'tournaments' ? id1 : null;
    stageId = p2 === 'stages' ? id2 : null;
  };

  onMount(() => {
    onHashChange();
    window.addEventListener('hashchange', onHashChange);
  });

  onDestroy(() => {
    window.removeEventListener('hashchange', onHashChange);
  });
</script>

{#if tournamentId && stageId}
  <Stage id={stageId} tournamentId={tournamentId} />
{:else if tournamentId}
  <Tournament id={tournamentId} />
{:else if url}
  <Tournaments />
{/if}