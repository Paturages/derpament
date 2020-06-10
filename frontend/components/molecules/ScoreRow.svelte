<script>
  export let player;
  export let score;
  export let combo;
  export let counts;
</script>

<div class="root">
  <div class="name">
    <a href={`https://osu.ppy.sh/users/${player.id}`} target="_blank">
      {player.name}
    </a>
  </div>
  <div class="info">
    <div class="combo">{combo} max combo</div>
    <div class="counts">
      {counts.max} /
      {counts[300]} /
      {counts[200]} /
      {counts[100]} /
      {counts[50]} /
      {counts.miss}
    </div>
  </div>
  <div class="score">{score.toLocaleString()}</div>
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
  .info {
    margin-left: 1em;
    text-align: right;
  }
  .score {
    width: 4em;
    margin-left: 1em;
    font-size: 1.5em;
    text-align: right;
  }
</style>