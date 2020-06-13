<script>
  export let player;
  export let score;
  export let combo;
  export let counts;
  export let index;
</script>

<div class="root">
  <div class="name">
    {index}.
    <a href={`https://osu.ppy.sh/users/${player.id}`} target="_blank">
      {player.name}
    </a>
  </div>
  <div class="info">
    <div class="combo">{combo} max combo</div>
    <div class="counts">
      {counts.max} |
      {counts[300]} |
      {counts[200]} |
      {counts[100]} |
      {counts[50]} |
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
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .score {
    width: 4em;
    margin-left: 1em;
    font-size: 1.5em;
    text-align: right;
  }
  .counts {
    font-size: .8em;
  }

  @media (max-width: 600px) {
    .root {
      flex-direction: column;
    }
    .info {
      order: 2;
      align-items: center;
    }
    .score {
      order: 1;
      text-align: center;
    }
  }
</style>