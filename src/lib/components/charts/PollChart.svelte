<script>
	import { select, area, max, min, scaleLinear, axisBottom, axisLeft, line } from 'd3';
	import {
		generateLinearXScale,
		getMaxFromArray,
		getMinFromArray
	} from '../../utilities/ChartUtil';
	import Tooltip from './interaction/Tooltip.svelte';
	import { onMount, onDestroy } from 'svelte';

	export let data;
	export let margin = 50;
	export let minX;
	export let maxX;
	export let minY;
	export let maxY;

	let chartContainerRef;
	let svg;
	let xAxis;
	let yAxis;

	//get min/max values for x and y axis if not propped.

	data.shift();

	if (!minX) {
		minX = min(data, (d) => d[0]);
	}
	if (!minY) {
		minY = getMinFromArray(data);
	}
	if (!maxX) {
		maxX = max(data, (d) => d[0]);
	}
	if (!maxY) {
		maxY = getMaxFromArray(data);
	}

	const loadChart = (chartContainerRef, data) => {
		console.log(chartContainerRef);
		const xScale = scaleLinear()
			.domain([minX, maxX])
			.range([0, chartContainerRef.offsetWidth - (3 * margin) / 2]);

		const yScale = scaleLinear()
			.domain([minY, maxY])
			.range([chartContainerRef.offsetHeight - margin, 0]);

		const xAxisElement = axisBottom(xScale);
		const yAxisElement = axisLeft(yScale);

		//indices 1 and 4 are the actual values
		//2 and 5 are the lows
		//3 and 6 are the highs
		//0 is the date values for x-axis

		const areaGenerator1 = area()
			.x((d) => xScale(d[0]))
			.y0((d) => yScale(d[2]))
			.y1((d) => yScale(d[3]));

		const mainLine1 = line()
			.x((d) => xScale(d[0]))
			.y((d) => yScale(d[1]));

		const areaGenerator2 = area()
			.x((d) => xScale(d[0]))
			.y0((d) => yScale(d[5]))
			.y1((d) => yScale(d[6]));

		const mainLine2 = line()
			.x((d) => xScale(d[0]))
			.y((d) => yScale(d[4]));

		svg = select(chartContainerRef)
			.append('svg')
			.attr('height', '100%')
			.attr('width', '100%')
			.attr('transform', `translate(${margin / 2},${margin / 2})`);

		yAxis = svg
			.append('g')
			.call(yAxisElement)
			.attr('transform', `translate(${margin / 2}, 0)`);

		xAxis = svg
			.append('g')
			.call(xAxisElement)
			.attr('transform', `translate(${margin / 2}, ${chartContainerRef.offsetHeight - margin})`);

		svg
			.append('g')
			.append('path')
			.attr('d', areaGenerator1(data))
			.attr('transform', `translate(${margin / 2}, 0)`)
			.attr('fill', 'pink');
		svg
			.append('g')
			.append('path')
			.attr('d', mainLine1(data))
			.attr('transform', `translate(${margin / 2}, 0)`)
			.attr('stroke', 'red')
			.attr('stroke-width', 3)
			.attr('fill', 'none');

		svg
			.append('g')
			.append('path')
			.attr('d', areaGenerator2(data))
			.attr('transform', `translate(${margin / 2}, 0)`)
			.attr('fill', 'lightblue');

		svg
			.append('g')
			.append('path')
			.attr('d', mainLine2(data))
			.attr('transform', `translate(${margin / 2}, 0)`)
			.attr('stroke', 'blue')
			.attr('stroke-width', 3)
			.attr('fill', 'none');
	};

	onMount(() => {
		if (chartContainerRef && data) {
			console.log('present', data);
			loadChart(chartContainerRef, data);
		}
	});
</script>

<div class="chart-container" bind:this={chartContainerRef}>
	<!-- {#if chartContainerRef}
		<Tooltip {tooltipState} {chartContainerRef} />
	{/if} -->
</div>

<style>
	.chart-container {
		height: 100%;
		width: 100%;
		background-color: aquamarine;
	}
</style>
