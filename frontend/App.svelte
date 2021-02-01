<script>
  import { onMount, onDestroy } from 'svelte';
  import Stage from './pages/Stage.svelte';
  import Tournament from './pages/Tournament.svelte';
  import Tournaments from './pages/Tournaments.svelte';

  let url;
  let tournamentId;
  let stageId;
  let query;

  const onHashChange = () => {
    url = location.hash.slice(1) || '/';
    const [, p1, id1, p2, part2] = url.split('/');
    const [id2, search] = (part2 || '').split('?');
    [, query] = (search || '').split('q=');
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
  <Stage id={stageId} {tournamentId} {query} />
{:else if tournamentId}
  <Tournament id={tournamentId} {query} />
{:else if url}
  <Tournaments />
{/if}