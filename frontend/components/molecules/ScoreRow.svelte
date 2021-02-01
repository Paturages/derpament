<script>
  export let player;
  export let score;
  export let combo;
  export let counts;
  export let index;

  const totalCount = counts.max + counts[300] + counts[200] + counts[100] + counts[50] + counts.miss;
  const accuracy = (
    (305 * counts.max) +
    (300 * counts[300]) +
    (200 * counts[200]) +
    (100 * counts[100]) +
    (50 * counts[50])
  ) / (3.05 * totalCount);
</script>

<div class="root">
  <div class="name">
    {index}.
    <a href={`https://osu.ppy.sh/users/${player.id}`} target="_blank">
      {player.name}
    </a>
    <small>{player.country}</small>
  </div>
  <div class="info">
    <div class="combo">{accuracy.toFixed(2)}%, {combo} combo</div>
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
  .name small {
    font-size: .5em;
  }
  .info {
    margin-left: 1em;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .score {
    width: 4.5em;
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