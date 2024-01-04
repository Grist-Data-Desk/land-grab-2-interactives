<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import cs from 'classnames';

  export let id: string;
  export let label: string;
  export let options: { label: string; value: string }[];
  export let selected: string;
  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher();

  const onChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    dispatch('change', { value: target.value });
  };
</script>

<div class={cs('stack stack-2xs', className)}>
  <label for={id} class="text-sm text-gray-600 md:text-base">{label}</label>
  <select
    {id}
    value={selected}
    class="w-full text-ellipsis border border-earth bg-smog p-2 font-sans-alt text-xs text-earth md:text-sm"
    on:change={onChange}
  >
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>
