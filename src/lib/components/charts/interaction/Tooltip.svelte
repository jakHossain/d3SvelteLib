<script>
	import { onMount } from 'svelte';

	export let tooltipState;
	export let chartContainerRef;

	let toolTipRef;

	let leftPos = '0px';
	let topPos = '0px';

	const updateToolTipPosition = (position, chartContainerRef, toolTipRef) => {
		if (!position || !chartContainerRef || !toolTipRef) return;

		const containerBounds = chartContainerRef.getBoundingClientRect();
		const toolTipBounds = toolTipRef.getBoundingClientRect();

		const widthOutRight = position.left + 20 + toolTipBounds.width > containerBounds.right;
		const heightOutTop = position.top + 20 + toolTipBounds.height > containerBounds.bottom;

		topPos = position.top + 16 + 'px';
		leftPos = position.left + 16 + 'px';

		if (widthOutRight) {
			leftPos = position.left - 4 - toolTipBounds.width + 'px';
		}

		if (heightOutTop) {
			topPos = position.top - 4 - toolTipBounds.height + 'px';
		}
	};

	$: {
		updateToolTipPosition(tooltipState.position, chartContainerRef, toolTipRef);
	}

	onMount(() => {
		console.log('TEST', chartContainerRef.getBoundingClientRect());
		console.log('TooltipRef', toolTipRef.getBoundingClientRect());
	});
</script>

<div
	bind:this={toolTipRef}
	class="tooltip"
	class:active={tooltipState?.active}
	style={`left: ${leftPos}; top: ${topPos};`}
>
	<slot></slot>
</div>

<style>
	.tooltip {
		position: fixed;
		opacity: 0;
		z-index: 5;
		padding: 0.5em;
		background-color: white;
		border: solid black 1px;
		border-radius: 6px;
		transition: opacity 200ms ease-out;
	}

	.tooltip.active {
		opacity: 1;
	}
</style>
