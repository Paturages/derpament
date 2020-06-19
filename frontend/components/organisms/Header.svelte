<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let backHref;

  let timeout;
  function handleSearch($event) {
    // 500 ms debounce
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(
      () => dispatch('search', $event.target.value),
      500
    );
  }
</script>

<div class="root">
  <div class="inner">
    <a href={backHref}>&lt;&nbsp;Back</a>
    <input
      type="search"
      placeholder="Filter on players"
      on:input={handleSearch}
    />
  </div>
</div>

<style>
  .root {
    background: var(--background-color);
    padding: 1em;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
  .inner {
    margin: 0 auto;
    padding: 0 2em;
    width: calc(100% - 1rem);
    max-width: var(--max-body-width);
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .inner input {
    margin-left: 1em;
  }
</style>