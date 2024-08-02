<script>
	import { fade } from 'svelte/transition';
	import { beforeUpdate, afterUpdate } from 'svelte';
	import { html } from 'd3';

	export let tooltipState;
	export let chartContainerRef;

	let leftPos, topPos;

	$: {
		leftPos = tooltipState.position.left + 16 + 'px';
		topPos = tooltipState.position.top + 16 + 'px';
	}
</script>

{#if tooltipState?.active}
	<div
		class="tooltip"
		style={`left: ${leftPos}; top: ${topPos};`}
		transition:fade={{ duration: 200 }}
	>
		<div>{tooltipState.label}</div>
		<div>{tooltipState.body}</div>
	</div>
{/if}

<style>
	.tooltip {
		position: fixed;
		z-index: 5;
		padding: 0.5em;
		background-color: white;
		border: solid black 1px;
		border-radius: 6px;
	}
	.tooltip h4,
	.tooltip p {
		margin: 0;
	}
</style>
