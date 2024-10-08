<script>
	export let margin = 40;

	export let data;

	import { onMount, onDestroy } from 'svelte';
	import { scaleLinear, select, selectAll, axisBottom, axisLeft } from 'd3';

	function debounce(func, wait) {
		let timeout;
		return function (...args) {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait);
		};
	}

	let chartElement;

	const loadChart = () => {
		const containerWidth = chartElement.offsetWidth;
		const containerHeight = chartElement.offsetHeight;

		select(chartElement).append('svg').attr('height', '100%').attr('width', '100%');

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
				select(this).style('stroke', 'white').style('stroke-width', '1.5px');
			})
			.on('mousemove', function (event, d) {
				let position = this.getBoundingClientRect();

				const datum = select(this).datum();

				select(chartElement)
					.select('.tooltip')
					.style('left', `${position.left + 30}px`)
					.style('top', `${position.top + 20}px`)
					.style('opacity', 1)
					.select('.label')
					.html(datum.label);

				select(chartElement)
					.select('.tooltip')
					.select('.x-coord')
					.html('X: ' + datum.x);

				select(chartElement)
					.select('.tooltip')
					.select('.y-coord')
					.html('Y: ' + datum.y);
			})
			.on('mouseout', function (event, d) {
				select(this).style('stroke', 'none').style('stroke-width', '0px').attr('r', 10);

				select(chartElement).select('.tooltip').style('opacity', 0);
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

		select(chartElement)
			.selectAll('circle')
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

	onMount(() => {
		loadChart();
		window.addEventListener('resize', updateChartSize);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', updateChartSize);
		}
	});
</script>

<div class="chart-container" bind:this={chartElement}>
	<div class="tooltip">
		<h4 class="label">LABEL</h4>
		<p class="x-coord">XCOORD</p>
		<p class="y-coord">YCOORD</p>
	</div>
</div>

<style>
	.chart-container {
		width: 100%;
		height: 100%;
		position: relative;
		background-color: lightpink;
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
