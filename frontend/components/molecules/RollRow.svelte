<script>
  export let player;
  export let roll;
  export let index;
</script>

<div class="root">
  <div class="name">
    {index}.
    <a href={`https://osu.ppy.sh/users/${player.id}`} target="_blank">
      {player.name}
    </a>
  </div>
  <div class="roll">{roll}</div>
</div>

<style>
  .root {
    display: flex;
    flex-direction: row;
    align-items: center;
    max-width: 800px;
    border-bottom: 1px solid #eee;
  }
  .name {
    font-size: 1.5em;
    flex: 1;
  }
  .roll {
    width: 4em;
    margin-left: 1em;
    font-size: 1.5em;
    text-align: right;
  }
</style>