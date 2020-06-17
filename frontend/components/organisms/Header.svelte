<script>
  export let backHref;
</script>

<div class="root">
  <div class="inner">
    <a href={backHref}>&lt;&nbsp;Back</a>
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
  }
</style>