<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id: string;
  export let label: string;
  export let options: { label: string; value: string }[];
  export let selected: string;

  const dispatch = createEventDispatcher();

  const onChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    dispatch('change', { value: target.value });
  };
</script>

<div class="stack stack-xs">
  <label for={id} class="text-base text-gray-600">{label}</label>
  <select
    {id}
    value={selected}
    class="border-earth bg-smog text-earth text-ellipsis border p-2 text-sm"
    on:change={onChange}
  >
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>
