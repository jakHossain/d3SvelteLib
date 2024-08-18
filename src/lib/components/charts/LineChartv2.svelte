<script>
	import { onMount, onDestroy } from 'svelte';
	import { initChartData } from '../../stores/ChartStore';
	import SvgContainer from '../chartElements/SvgContainer.svelte';
	import { generateLinearScales } from '../../utilities/ChartUtil';
	import { select, selectAll, line, min, max, axisBottom, axisLeft } from 'd3';

	export let chartData;
	export let margin = 25;
	export let minY;
	export let minX;
	export let maxY;
	export let maxX;

	let xScale;
	let yScale;
	let linePath;
	let linePoints;
	let xAxis;
	let yAxis;

	//min max values if not provided
	if (!minY) {
		minY = min(chartData, (d) => d.y);
	}

	if (!minX) {
		minX = min(chartData, (d) => d.x);
	}

	if (!maxY) {
		maxY = max(chartData, (d) => d.y);
	}

	if (!maxX) {
		maxX = max(chartData, (d) => d.x);
	}

	const [subscribeChartState, chartStateDispatch] = initChartData();
	let chartState;
	const unsubscribeChartState = subscribeChartState((state) => {
		chartState = state;
	});

	chartStateDispatch.setChartData(chartData);

	const loadChart = () => {
		const { chartContainer, svgContainer } = chartState;

		({ xScale, yScale } = generateLinearScales(
			chartState.data,
			svgContainer,
			minX,
			maxX,
			minY,
			maxY,
			margin
		));

		//draw axis
		xAxis = select(svgContainer)
			.select('.x-axis')
			.call(axisBottom(xScale))
			.attr(
				'transform',
				`translate(${margin}, ${svgContainer.getBoundingClientRect().height - margin})`
			);

		yAxis = select(svgContainer)
			.select('.y-axis')
			.call(axisLeft(yScale))
			.attr('transform', `translate(${margin}, ${margin})`);

		//draww line path
		const lineData = line()
			.x((d, i) => xScale(d.x))
			.y((d, i) => yScale(d.y));

		linePath = select(svgContainer)
			.select('.chartBody')
			.append('g')
			.append('path')
			.datum(chartState.data)
			.attr('d', lineData)
			.attr('transform', `translate(${margin}, ${margin})`)
			.attr('fill', 'none')
			.style('stroke-width', '2px')
			.style('stroke', 'black');

		console.log(linePath);

		linePoints = select(svgContainer)
			.select('.chartBody')
			.append('g')
			.selectAll('circle')
			.data(chartState.data)
			.join('circle')
			.attr('cx', function (d, i) {
				return xScale(d.x);
			})
			.attr('cy', function (d, i) {
				return yScale(d.y);
			})
			.attr('r', 5)
			.attr('transform', `translate(${margin}, ${margin})`);
	};

	$: chartState?.svgContainer && chartState?.chartContainer && loadChart();

	onMount(() => {});

	onDestroy(() => {
		unsubscribeChartState();
	});
</script>

<SvgContainer
	{chartStateDispatch}
	resizeFunc={() => {
		console.log('Resize!!');
	}}
>
	<span slot="chartTitle"
		>Chart title: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<span slot="chartDeck"
		>Chart deck: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
</SvgContainer>

<button
	on:click={() => {
		console.log(xScale, yScale);
	}}
	>asdsad
</button>
