<script>
	//these imports are based off if this code is run from /charts
	import { initializeToolTip } from './interaction/TooltipUtility';
	import SvgContainer from '../chartElements/SvgContainer.svelte';
	import { initChartData } from '../../stores/ChartStore';
	import { onDestroy, onMount } from 'svelte';
	import { resizeDebounce } from '../../utilities/ChartUtil';

	export let chartData;
	export let margin = 25;
	export let minY;
	export let minX;
	export let maxY;
	export let maxX;

	//chart state configuration

	let chartState;
	let tooltipState;
	const tooltipDisplay = {};

	const [subscribeChartState, chartStateDispatch] = initChartData();
	const unsubscribeChartState = subscribeChartState((state) => {
		chartState = state;
	});

	const { subscribeTooltip, enable, disable } = initializeToolTip();

	const unsubscribeTooltip = subscribeTooltip((state) => {
		tooltipState = state;
	});

	//func to take in JSON'd CSV data (which is passed in as chartData), do any specific chart-type cleaning here before hooking onto chartState;
	const processCsvData = (chartData) => {};
	processCsvData(chartData);

	//resizing utility functions should be defined here before called in resizeFunc; debouncedResizer is what actually be called (for performance improvements)

	const resizeFunc = () => {};
	const debouncedResizer = resizeDebounce(resizeFunc, 100);

	//function to draw chart, put initial scale defining logic here. Can add chart drawing utility functions here as well for refactoring (recommended)
	const loadChart = () => {
		processCsvData();
	};

	onMount(() => {
		if (typeof window != 'undefined') {
			window.addEventListener('resize', debouncedResizer);
		}
	});

	onDestroy(() => {
		if (typeof window != 'undefined') {
			window.removeEventListener('resize', debouncedResizer);
		}
		unsubscribeTooltip();
		unsubscribeChartState();
	});

	$: svgContainer && chartState?.chartContainer && chartState?.data && loadChart();
</script>

<SvgContainer {chartStateDispatch} {resizeFunc} {tooltipState} {margin}>
	<span slot="chartTitle"
		>Poll Chart: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<span slot="chartDeck"
		>Chart deck: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<div slot="tooltipOutput"></div>
</SvgContainer>

<style>
	.tooltip-label {
		margin: 0.5em 0;
		font-size: 1.2rem;
	}

	.tooltip-body {
		font-size: 1rem;
		margin: 0;
	}

	.tooltip-body strong {
		font-size: 1rem;
		margin: 0;
	}
</style>
