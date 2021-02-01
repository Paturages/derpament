<script>
  import RollRow from '../molecules/RollRow.svelte';

  export let players;
  export let rolls;
  export let filter;
  
  let displayRolls = true;
  let rollsArray = [];
  let count = 0;
  let sum = 0;
  Object.keys(rolls).forEach(playerId => {
    rolls[playerId].forEach(roll => {
      ++count;
      sum += roll;
      rollsArray.push({
        player: players[playerId],
        value: roll
      });
    });
  });
  const average = (sum / count).toFixed(2);
  rollsArray = rollsArray.sort((a, b) => a.value < b.value ? 1 : -1);
  rollsArray.forEach((roll, i) => {
    roll.index = i && rollsArray[i-1].value === roll.value ? rollsArray[i-1].index : i+1;
  });
  
  function handleToggle() {
    displayRolls = !displayRolls;
  }

  function rollMatchesFilter(roll, filter) {
    if (!filter) return true;
    let [, country] = filter.match(/country=(.*)/i) || [];
    if (country) return roll.player.country.toLowerCase().includes(country.toLowerCase());
    return roll.player.name.toLowerCase().includes(filter.toLowerCase());
  }
</script>

<div class="root">
  <button on:click={handleToggle}>{displayRolls ? 'Hide' : 'Show'} rolls</button>
  {#if displayRolls}
    <div class="rolls">
      {#each rollsArray as roll}
        {#if rollMatchesFilter(roll, filter)}
          <RollRow
            index={roll.index}
            player={roll.player}
            roll={roll.value}
          />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .rolls {
    margin: 1em 0 2em;
  }
</style>