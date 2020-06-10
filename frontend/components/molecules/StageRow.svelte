<script>
  export let name;
  export let mapCount;
  export let href;
</script>

<div class="root">
  <div class="name">
    <a href={href}>
      {name}
    </a>
  </div>
  <div class="maps">{mapCount}&nbsp;maps</div>
</div>

<style>
  .root {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 800px;
    border-bottom: 1px solid #eee;
  }
  .name {
    font-size: 1.5em;
  }
  .maps {
    margin-left: 1em;
  }
</style>