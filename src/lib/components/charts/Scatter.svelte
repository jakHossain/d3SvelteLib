<script>
	export let margin = 40;

	export let height;
	export let width;

	export let data = [
		{ x: 10, y: 15, label: 'A' },
		{ x: 20, y: 25, label: 'B' },
		{ x: 30, y: 10, label: 'C' },
		{ x: 40, y: 30, label: 'D' },
		{ x: 50, y: 20, label: 'E' },
		{ x: 60, y: 40, label: 'F' },
		{ x: 70, y: 35, label: 'G' },
		{ x: 80, y: 45, label: 'H' },
		{ x: 90, y: 55, label: 'I' },
		{ x: 100, y: 50, label: 'J' }
	];

	import { onMount, onDestroy } from 'svelte';
	import { scaleLinear, select, selectAll, axisBottom, axisLeft } from 'd3';

	let chartElement;

	const loadChart = () => {
		const svgWidth = chartElement.width.baseVal.value;
		const svgHeight = chartElement.height.baseVal.value;

		let scaleX = scaleLinear()
			.domain([0, 100])
			.range([0, svgWidth - margin]);

		let scaleY = scaleLinear()
			.domain([0, 55])
			.range([svgHeight - margin, 0]);

		let axisX = axisBottom(scaleX);
		let axisY = axisLeft(scaleY);

		select('.chart')
			.selectAll('circle')
			.data(data)
			.join('circle')
			.attr('cx', (d, i) => scaleX(d.x) + margin / 2)
			.attr('cy', (d, i) => scaleY(d.y) + margin / 2)
			.attr('r', 10);

		select('.chart')
			.append('g')
			.call(axisX)
			.attr('transform', `translate(${margin / 2}, ${svgHeight - margin / 2})`)
			.attr('id', 'x-axis');

		select('.chart')
			.append('g')
			.call(axisY)
			.attr('transform', `translate(${margin / 2},${margin / 2})`)
			.attr('id', 'y-axis');
	};

	const updateChartSize = () => {
		const svgWidth = chartElement.width.baseVal.value;
		const svgHeight = chartElement.height.baseVal.value;

		let scaleX = scaleLinear()
			.domain([0, 100])
			.range([0, svgWidth - margin]);

		let scaleY = scaleLinear()
			.domain([0, 55])
			.range([svgHeight - margin, 0]);

		let axisX = axisBottom(scaleX);
		let axisY = axisLeft(scaleY);

		selectAll('circle')
			.transition()
			.attr('cx', (d, i) => scaleX(d.x) + margin / 2)
			.attr('cy', (d, i) => scaleY(d.y) + margin / 2);

		select('#x-axis')
			.transition()
			.call(axisX)
			.attr('transform', `translate(${margin / 2}, ${svgHeight - margin / 2})`);

		select('#y-axis')
			.transition()
			.call(axisY)
			.attr('transform', `translate(${margin / 2},${margin / 2})`);
	};

	onMount(() => {
		loadChart();
		console.log(chartElement.width.baseVal.value);

		window.addEventListener('resize', updateChartSize);
	});
</script>

<svg class="chart" bind:this={chartElement} {width} {height}> </svg>

<style>
	.chart {
		width: 100%;
		height: 100%;

		background-color: lightpink;
	}
</style>
