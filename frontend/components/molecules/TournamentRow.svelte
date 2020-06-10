<script>
  export let name;
  export let id;
  export let playersCount;
</script>

<div class="root">
  <div class="name">
    <a href={`#/tournaments/${id}`}>
      {name}
    </a>
  </div>
  <div class="players">{playersCount}&nbsp;players</div>
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
  .players {
    margin-left: 1em;
  }
</style>