<script>
  export let id;
  export let name;
  export let avatar;
  export let country;
  export let pp;
  export let rank;
  export let countryRank;
</script>

<div class="root">
  <div class="avatar">
    <img src={avatar} alt="" />
  </div>
  <div class="name">
    <a href={`https://osu.ppy.sh/users/${id}`} target="_blank">
      {name}
    </a>
  </div>
  <div class="info">
    #{rank} ({pp} pp)<br />
    {country} (#{countryRank})
  </div>
</div>

<style>
  .root {
    height: 4em;
    display: flex;
    flex-direction: row;
    align-items: center;
    max-width: 800px;
    border-bottom: 1px solid #eee;
  }
  .avatar {
    width: 3.5em;
    height: 3.5em;
    margin-right: 1em;
  }
  .avatar img {
    border-radius: 50%;
  }
  .name {
    font-size: 1.5em;
    flex: 1;
  }
  .info {
    margin-left: 1em;
    text-align: right;
  }
</style>