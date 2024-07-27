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
		const containerWidth = chartElement.offsetWidth;
		const containerHeight = chartElement.offsetHeight;

		select(chartElement)
			.append('svg')
			.attr('height', containerHeight)
			.attr('width', containerWidth);

		let scaleX = scaleLinear()
			.domain([0, 100])
			.range([0, containerWidth - margin]);

		let scaleY = scaleLinear()
			.domain([0, 55])
			.range([containerHeight - margin, 0]);

		let axisX = axisBottom(scaleX);
		let axisY = axisLeft(scaleY);

		select(chartElement)
			.select('svg')
			.selectAll('circle')
			.data(data)
			.join('circle')
			.attr('cx', (d, i) => scaleX(d.x) + margin / 2)
			.attr('cy', (d, i) => scaleY(d.y) + margin / 2)
			.attr('r', 10)
			.on('mouseover', function (event, d) {
				select(this).transition().style('stroke', 'white').style('stroke-width', 4).attr('r', 25);
			})
			.on('mouseout', function (event, d) {
				select(this).transition().style('stroke', 'none').style('stroke-width', 0).attr('r', 10);
			});

		select(chartElement)
			.select('svg')
			.append('g')
			.call(axisX)
			.attr('transform', `translate(${margin / 2}, ${containerHeight - margin / 2})`)
			.attr('id', 'x-axis');

		select(chartElement)
			.select('svg')
			.append('g')
			.call(axisY)
			.attr('transform', `translate(${margin / 2},${margin / 2})`)
			.attr('id', 'y-axis');
	};

	const updateChartSize = () => {
		const containerWidth = chartElement.offsetWidth;
		const containerHeight = chartElement.offsetHeight;

		let scaleX = scaleLinear()
			.domain([0, 100])
			.range([0, containerWidth - margin]);

		let scaleY = scaleLinear()
			.domain([0, 55])
			.range([containerHeight - margin, 0]);

		let axisX = axisBottom(scaleX);
		let axisY = axisLeft(scaleY);

		select('.chart-container svg').attr('height', containerHeight).attr('width', containerWidth);

		selectAll('circle')
			.transition()
			.attr('cx', (d, i) => scaleX(d.x) + margin / 2)
			.attr('cy', (d, i) => scaleY(d.y) + margin / 2);

		select('#x-axis')
			.transition()
			.call(axisX)
			.attr('transform', `translate(${margin / 2}, ${containerHeight - margin / 2})`);

		select('#y-axis')
			.transition()
			.call(axisY)
			.attr('transform', `translate(${margin / 2},${margin / 2})`);
	};

	const spawnTooltip = () => {
		select(chartElement).append('div').style('position', 'absolute').text('SEFESF');
	};

	onMount(() => {
		loadChart();
		spawnTooltip();
		window.addEventListener('resize', updateChartSize);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', updateChartSize);
		}
	});
</script>

<div class="chart-container" bind:this={chartElement} {width} {height}></div>

<style>
	.chart-container {
		width: 100%;
		height: 100%;
		position: relative;
		background-color: lightpink;
	}
</style>
