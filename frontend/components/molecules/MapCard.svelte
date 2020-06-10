<script>
  export let title;
  export let artist;
  export let mapper;
  export let difficulty;
  export let beatmapId;
  export let beatmapSetId;
  export let hp;
  export let od;
  export let category;
  export let counts;
</script>

<div class="root">
  <div class="title">
    <a href={`https://osu.ppy.sh/beatmapsets/${beatmapSetId}#mania/${beatmapId}`} target="_blank">
      <div class="artist">{artist}</div>
      <div class="name" title={title}>{title}</div>
    </a>
    <div class="mapper">
      <b>[{difficulty}]</b><br />beatmap set by <b>{mapper}</b>
    </div>
    <div class="metrics">
      HP {hp}, OD {od}
    </div>
  </div>
  <div class="category">{category}</div>
  <div class="counts">
    {counts.notes.total} notes<br />({counts.notes.rice} rice, {counts.notes.ln} LNs)<br />
    {counts.bpm} BPM events<br />
    {counts.sv} SV events<br />
    {counts.notes.single} singles<br />
    {counts.notes.jump} jumps<br />
    {counts.notes.hand} hands<br />
    {counts.notes.quad} quads
  </div>
</div>

<style>
  .root {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    max-width: 800px;
    border-bottom: 1px solid #eee;
    position: relative;
  }
  .name {
    font-size: 1.5em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 500px;
  }
  .metrics {
    font-size: .8em;
  }
  .title {
    flex: 1;
  }
  .category {
    position: absolute;
    bottom: 0;
    left: 0;
    text-transform: uppercase;
  }
  .counts {
    font-size: .9em;
    margin-left: 1em;
    text-align: right;
  }
</style>