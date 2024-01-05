<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    dispatch('change', { checked: target.checked });
  };

  export let id: string;
  export let label: string;
  export let checked: boolean;
</script>

<div class="stack-h stack-h-xs text-xs">
  <input type="checkbox" {id} on:change={onChange} {checked} />
  <label for={id}>{label}</label>
</div>
