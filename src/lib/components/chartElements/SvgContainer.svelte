<script>
	import { onDestroy, onMount } from 'svelte';
	import { resizeDebounce } from '../../utilities/ChartUtil';
	import Tooltip from '../charts/interaction/Tooltip.svelte';

	export let chartStateDispatch;
	export let resizeFunc;
	export let tooltipState;

	let chartContainerRef;
	let svgRef;

	$: svgRef && chartStateDispatch.setSvgContainer(svgRef);

	$: chartContainerRef && chartStateDispatch.setChartContainer(chartContainerRef);

	const debouncedResizer = resizeDebounce(resizeFunc, 250);

	onMount(() => {
		if (typeof window != 'undefined') {
			window.addEventListener('resize', debouncedResizer);
		}
	});

	onDestroy(() => {
		if (typeof window != 'undefined') {
			window.removeEventListener('resize', debouncedResizer);
		}
	});
</script>

<div bind:this={chartContainerRef} class="chart-container">
	<h4 class="chart-title">
		<slot name="chartTitle"></slot>
	</h4>
	<h5 class="chart-deck">
		<slot name="chartDeck"></slot>
	</h5>
	<svg bind:this={svgRef} class="svgBody">
		<g class="chartBody"></g>
		<g class="x-axis axis"> </g>
		<g class="y-axis axis"> </g>
	</svg>
	{#if svgRef}
		<Tooltip {tooltipState} chartContainerRef={svgRef}>
			<slot name="tooltipOutput"></slot>
		</Tooltip>
	{/if}
</div>

<style>
	.chart-container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.chart-title {
		font-weight: 700;
		font-size: 20px;
		margin: 0;
	}

	.chart-deck {
		font-weight: normal;
		font-size: 16px;
		margin: 10px 0;
	}

	.svgBody {
		flex-grow: 1;
		width: 100%;
	}
</style>
