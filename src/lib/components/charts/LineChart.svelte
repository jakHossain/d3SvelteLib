<script>
	import { axisBottom, axisLeft, extent, line, max, scaleLinear, select } from 'd3';
	import { onMount, onDestroy } from 'svelte';
	import { generateLinearScales } from '../../utilities/ChartUtil';

	import ToolTip from './interaction/Tooltip.svelte';
	import { initializeToolTip } from './interaction/TooltipUtility';

	export let margin = 50;
	export let data;

	let chartContainer;

	const { enable, disable, reset, subscribe } = initializeToolTip();

	let tooltipState;

	const unsubscribeTooltip = subscribe((state) => {
		console.log('uploading state:', state);
		tooltipState = state;
		console.log(tooltipState);
	});

	const loadChart = () => {
		const svg = select(chartContainer).append('svg').attr('height', '100%').attr('width', '100%');
		const containerWidth = chartContainer.offsetWidth;
		const containerHeight = chartContainer.offsetHeight;

		const xScale = scaleLinear()
			.domain([0, max(data, (d) => d.x)])
			.range([0, containerWidth - margin]);

		const yScale = scaleLinear()
			.domain([0, max(data, (d) => d.y)])
			.range([containerHeight - margin, 0]);

		const yAxis = axisLeft(yScale);
		const xAxis = axisBottom(xScale);

		const lineData = line()
			.x((d, i) => xScale(d.x))
			.y((d, i) => yScale(d.y));

		//y-axis
		svg
			.append('g')
			.call(yAxis)
			.attr('transform', `translate(${margin / 2}, ${margin / 2})`);

		//x-axis
		svg
			.append('g')
			.call(xAxis)
			.attr('transform', `translate(${margin / 2}, ${containerHeight - margin / 2})`);

		//line path
		svg
			.append('g')
			.append('path')
			.datum(data)
			.attr('d', lineData)
			.attr('transform', `translate(${margin / 2}, ${margin / 2})`)
			.attr('class', 'line')
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

				enable({ top: position.top, left: position.left }, `${datum.x}`);
			})
			.on('mouseout', function (event, d) {
				select(this).attr('stroke-width', '0px').attr('stroke', 'black');

				disable();
			});
	};

	onMount(() => {
		loadChart();
	});

	onDestroy(() => {
		unsubscribeTooltip();
	});
</script>

<div class="chart-container" bind:this={chartContainer}>
	<ToolTip {tooltipState} chartContainerRef={chartContainer} />
</div>

<style>
	.chart-container {
		height: 100%;
		width: 100%;
		background-color: aquamarine;
	}
</style>
