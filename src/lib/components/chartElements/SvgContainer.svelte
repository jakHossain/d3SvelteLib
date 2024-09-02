<script>
	import { onDestroy, onMount } from 'svelte';
	import { resizeDebounce } from '../../utilities/ChartUtil';
	import Tooltip from '../charts/interaction/Tooltip.svelte';
	import InteractionWindow from '../charts/interaction/InteractionWindow.svelte';

	export let chartStateDispatch;
	export let resizeFunc;
	export let tooltipState;
	export let margin;
	export let IW = false;
	export let onIWHover;
	export let onIWExit;

	let chartContainerRef;
	let svgRef;
	let svgDivContainer;

	$: svgRef && chartStateDispatch.setSvgContainer(svgRef);

	$: chartContainerRef && chartStateDispatch.setChartContainer(chartContainerRef);

	const debouncedResizer = resizeDebounce(resizeFunc, 100);

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
	<div class="svg-container" bind:this={svgDivContainer}>
		<svg bind:this={svgRef} class="svg-body">
			<g class="chartBody"></g>
			<g class="x-axis axis"> </g>
			<g class="y-axis axis"> </g>
		</svg>
		{#if svgRef}
			<Tooltip {tooltipState} chartContainerRef={svgRef}>
				<slot name="tooltipOutput"></slot>
			</Tooltip>
		{/if}
		{#if IW && svgDivContainer}
			<InteractionWindow {margin} {svgDivContainer} {onIWHover} {onIWExit} />
		{/if}
	</div>
</div>

<style>
	.chart-container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
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

	.svg-container {
		width: 100%;
		flex-grow: 1;
		position: relative;
	}
	.svg-body {
		width: 100%;
		height: 100%;
	}
</style>
