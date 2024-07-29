<script>
	export let data;
	export let margin;

	import { onMount, onDestroy } from 'svelte';
	import { select, selectAll, line, scaleLinear } from 'd3';

	//to be bound to parent div container
	let chartContainer;

	const loadChart = () => {
		const containerWidth = chartContainer.offsetWidth;
		const containerHeight = chartContainer.offsetHeight;

		const xScale = scaleLinear()
			.domain([0, 100])
			.range([0, containerWidth - margin]);
		const yScale = scaleLinear()
			.domain([0, 55])
			.range([containerHeight, 0 + margin]);

		let linePath = line()
			.x((d, i) => xScale(d.x))
			.y((d, i) => yScale(d.y));

		select(chartContainer)
			.append('svg')
			.attr('width', '100%')
			.attr('height', '100%')
			.append('path')
			.datum(data)
			.attr('d', linePath)
			.attr('stroke', 'black')
			.attr('stroke-width', '2px')
			.attr('fill', 'none');
	};

	onMount(() => {
		loadChart();
	});
</script>

<div class="chart-container" bind:this={chartContainer}>
	<div class="tooltip">
		<h4 class="tooltip-label">LABEL</h4>
		<p class="x-coord"></p>
		<p class="y-coord"></p>
	</div>
</div>

<style>
	.chart-container {
		width: 100%;
		height: 100%;
		position: relative;
		background-color: lightblue;
	}

	.tooltip {
		position: fixed;
		opacity: 0;
		background-color: antiquewhite;
		padding: 0.25em 0.5em;
		border-radius: 4px;
		border: 1px solid black;
	}

	.tooltip h4,
	p {
		margin: 0;
	}
</style>
