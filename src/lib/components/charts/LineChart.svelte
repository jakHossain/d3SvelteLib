<script>
	import { axisBottom, axisLeft, extent, line, max, scaleLinear, select } from 'd3';
	import { onMount, onDestroy } from 'svelte';
	import {
		generateLinearScales,
		resizeScales,
		updatePointPosition,
		updateLinePath
	} from '../../utilities/ChartUtil';

	import ToolTip from './interaction/Tooltip.svelte';
	import { initializeToolTip } from './interaction/TooltipUtility';

	export let data;
	export let margin = 50;
	export let xMin = 0;
	export let xMax = null;
	export let yMin = 0;
	export let yMax = null;

	let chartContainer;
	let xAxis;
	let yAxis;
	let linePath;

	const { enable, disable, reset, subscribe } = initializeToolTip();

	let tooltipState;

	const unsubscribeTooltip = subscribe((state) => {
		tooltipState = state;
	});

	const loadChart = () => {
		const svg = select(chartContainer).append('svg').attr('height', '100%').attr('width', '100%');

		const { xScale, yScale } = generateLinearScales(
			data,
			chartContainer,
			xMin,
			xMax,
			yMin,
			yMax,
			margin
		);

		const yAxisScale = axisLeft(yScale);
		const xAxisScale = axisBottom(xScale);

		const lineData = line()
			.x((d, i) => xScale(d.x))
			.y((d, i) => yScale(d.y));

		//y-axis
		yAxis = svg
			.append('g')
			.attr('class', 'y-axis axis')
			.call(yAxisScale)
			.attr('transform', `translate(${margin / 2}, ${margin / 2})`);

		//x-axis
		xAxis = svg
			.append('g')
			.attr('class', 'x-axis axis')
			.call(xAxisScale)
			.attr('transform', `translate(${margin / 2}, ${chartContainer.offsetHeight - margin / 2})`);

		//line path
		linePath = svg
			.append('g')
			.append('path')
			.datum(data)
			.attr('d', lineData)
			.attr('transform', `translate(${margin / 2}, ${margin / 2})`)
			.attr('class', 'line data-line')
			.attr('fill', 'none')
			.style('stroke-width', '2px')
			.style('stroke', 'black');

		//points

		svg
			.selectAll('circle')
			.data(data)
			.join('circle')
			.attr('cx', (d, i) => {
				return xScale(d.x) + margin / 2;
			})
			.attr('cy', (d, i) => {
				return yScale(d.y) + margin / 2;
			})
			.attr('r', 6)
			.on('mouseover', function (event, d) {
				select(this).attr('stroke-width', '1px').attr('stroke', 'white');
			})
			.on('mousemove', function (event, d) {
				const position = event.target.getBoundingClientRect();
				const datum = select(this).datum();

				enable({ top: position.top, left: position.left }, datum.x, datum.label);
			})
			.on('mouseout', function (event, d) {
				select(this).attr('stroke-width', '0px').attr('stroke', 'black');

				disable();
			});
	};

	const updateChartResizeController = () => {
		const { xScale, yScale } = resizeScales(
			data,
			chartContainer,
			xAxis,
			yAxis,
			xMin,
			xMax,
			yMin,
			yMax,
			margin
		);
		updatePointPosition(data, chartContainer, xScale, yScale, margin);
		updateLinePath(chartContainer, xScale, yScale, margin);
	};

	onMount(() => {
		loadChart();
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', updateChartResizeController);
		}
	});

	onDestroy(() => {
		unsubscribeTooltip();
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', updateChartResizeController);
		}
	});
</script>

<div class="chart-container" bind:this={chartContainer}>
	{#if chartContainer}
		<ToolTip {tooltipState} chartContainerRef={chartContainer} />
	{/if}
</div>

<style>
	.chart-container {
		height: 100%;
		width: 100%;
		background-color: aquamarine;
	}
</style>
