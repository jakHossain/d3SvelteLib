<script>
	import { onMount, onDestroy } from 'svelte';
	import { select, selectAll, line, min, max, axisBottom, axisLeft } from 'd3';
	import SvgContainer from '../chartElements/SvgContainer.svelte';
	import { generateLinearScales, getMinMaxFromDataObject } from '../../utilities/ChartUtil';
	import { initChartData } from '../../stores/ChartStore';
	import { initializeToolTip } from '../charts/interaction/TooltipUtility.js';

	export let chartData;
	export let margin = 25;
	export let minY;
	export let minX;
	export let maxY;
	export let maxX;

	//state variables
	let chartState;
	let tooltipState;
	let tooltipDisplay = { label: '', x: '', y: '' };

	const [subscribeChartState, chartStateDispatch] = initChartData();
	const unsubscribeChartState = subscribeChartState((state) => {
		chartState = state;
	});

	chartStateDispatch.setChartData(chartData);

	const { enable, disable, subscribeTooltip } = initializeToolTip();

	const unsubscribeTooltip = subscribeTooltip((state) => {
		tooltipState = state;
	});

	//vhart variables
	let svgContainer;
	let xScale;
	let yScale;
	let linePath;
	let linePoints;
	let xAxis;
	let yAxis;

	console.log(chartData);

	//min max values if not provided
	if (!minY || !maxY) {
		const { minVal, maxVal } = getMinMaxFromDataObject(
			chartData.data,
			chartData.fields.slice(1, chartData.fields.length)
		);

		if (!minY) minY = minVal;
		if (!maxY) maxY = maxVal;

		console.log(minY, maxY);
	}

	if (!minX || !maxX) {
		const { minVal, maxVal } = getMinMaxFromDataObject(
			chartData.data,
			chartData.fields.slice(0, 1)
		);

		if (!minX) minX = minVal;
		if (!maxX) maxX = maxVal;
		console.log(minX, maxX);
	}

	// if (!minY) {
	// 	minY = min(chartData, (d) => d.y);
	// }

	// if (!minX) {
	// 	minX = min(chartData, (d) => d.x);
	// }

	// if (!maxY) {
	// 	maxY = max(chartData, (d) => d.y);
	// }

	// if (!maxX) {
	// 	maxX = max(chartData, (d) => d.x);
	// }

	const loadChart = () => {
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
			.attr('r', 7)
			.attr('transform', `translate(${margin}, ${margin})`);

		//configure interactivity
		linePoints
			.on('mouseover', function (event, d) {
				select(this).attr('stroke-width', '1px').attr('stroke', 'white');
			})
			.on('mousemove', function (event, d) {
				const pointPos = event.target.getBoundingClientRect();
				enable({ top: pointPos.top, left: pointPos.left });
				tooltipDisplay.label = d.label;
				tooltipDisplay.x = d.x;
				tooltipDisplay.y = d.y;
			})
			.on('mouseout', function (event, d) {
				disable();
				select(this).attr('stroke-width', '0');
			});
	};

	$: {
		if (chartState?.svgContainer) {
			svgContainer = chartState.svgContainer;
		}
	}

	$: chartState?.svgContainer && chartState?.chartContainer && loadChart();

	//resizing util funcs
	const resizeAxis = () => {
		({ xScale, yScale } = generateLinearScales(
			chartState.data,
			svgContainer,
			minX,
			maxX,
			minY,
			maxY,
			margin
		));

		xAxis
			.transition()
			.call(axisBottom(xScale))
			.attr(
				'transform',
				`translate(${margin}, ${svgContainer.getBoundingClientRect().height - margin})`
			);
		yAxis.transition().call(axisLeft(yScale)).attr('transform', `translate(${margin}, ${margin})`);
	};

	const resizePoints = () => {
		linePoints
			.transition()
			.attr('cx', function (d, i) {
				return xScale(d.x);
			})
			.attr('cy', function (d, i) {
				return yScale(d.y);
			})
			.attr('transform', `translate(${margin}, ${margin})`);
	};

	const resizeLine = () => {
		const lineData = line()
			.x((d, i) => xScale(d.x))
			.y((d, i) => yScale(d.y));

		linePath.transition().attr('d', lineData);
	};

	const resizeFunc = () => {
		resizeAxis();
		resizePoints();
		resizeLine();
	};

	onMount(() => {});

	onDestroy(() => {
		unsubscribeChartState();
		unsubscribeTooltip();
	});
</script>

<SvgContainer {chartStateDispatch} {resizeFunc} {tooltipState}>
	<span slot="chartTitle"
		>Chart title: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<span slot="chartDeck"
		>Chart deck: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<div slot="tooltipOutput">
		<h5 class="tooltip-label">{tooltipDisplay.label}</h5>
		<p class="tooltip-body"><strong>X:</strong> {tooltipDisplay.x}</p>
		<p class="tooltip-body"><strong>Y:</strong> {tooltipDisplay.y}</p>
	</div>
</SvgContainer>

<button
	on:click={() => {
		console.log(xScale, yScale);
	}}
	>asdsad
</button>

<style>
	.tooltip-label {
		margin: 0;
		margin-bottom: 0.4em;
	}

	.tooltip-body {
		margin: 0;
	}
</style>
