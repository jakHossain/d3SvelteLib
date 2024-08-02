<script>
	import { fade } from 'svelte/transition';
	import { beforeUpdate, afterUpdate } from 'svelte';

	export let tooltipState;
	export let chartContainerRef;

	let leftPos, topPos;

	$: {
		leftPos = tooltipState.position.left + 16 + 'px';
		topPos = tooltipState.position.top + 16 + 'px';
	}
</script>

{#if tooltipState?.active}
	<div class="tooltip" style={`left: ${leftPos}; top: ${topPos};`} transition:fade>
		<h4>{tooltipState.label}</h4>
		<p>{tooltipState.body}</p>
	</div>
{/if}

<style>
	.tooltip {
		position: fixed;
		z-index: 5;
		padding: 0.25em;
		background-color: whitesmoke;
		border: solid black 1px;
	}
	.tooltip h4,
	.tooltip p {
		margin: 0;
	}
</style>
