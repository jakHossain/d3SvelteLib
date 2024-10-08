<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		select,
		selectAll,
		line,
		min,
		max,
		axisBottom,
		axisLeft,
		timeFormat,
		bisector,
		reverse
	} from 'd3';
	import SvgContainer from '../chartElements/SvgContainer.svelte';
	import { getMonthYear } from '../../utilities/DateTimeUtil';
	import {
		generateLinearYScale,
		getMinMaxFromDataObject,
		generateXDateScale
	} from '../../utilities/ChartUtil';
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

	//chart structure variables
	let svgContainer;
	let xScale;
	let yScale;
	let xAxis;
	let yAxis;

	//chart specific vars
	let linePoints = {};
	let linePaths = {};

	//min max values if not provided
	if (!minY || !maxY) {
		const { minVal, maxVal } = getMinMaxFromDataObject(
			chartData.data,
			chartData.fields.slice(1, chartData.fields.length)
		);

		if (!minY) minY = minVal;
		if (!maxY) maxY = maxVal;
	}

	if (!minX || !maxX) {
		const { minVal, maxVal } = getMinMaxFromDataObject(
			chartData.data,
			chartData.fields.slice(0, 1)
		);

		if (!minX) minX = minVal;
		if (!maxX) maxX = maxVal;
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

	const drawLines = () => {
		//copy fields to prevent overwriting state
		const fields = [...chartState.data.fields];
		const xField = fields.shift();

		for (let yField of fields) {
			//draww line path
			const lineData = line()
				.x((d, i) => xScale(d[xField]))
				.y((d, i) => yScale(d[yField]));

			const linePath = select(svgContainer)
				.select('.chartBody')
				.append('g')
				.append('path')
				.datum(chartState.data.data)
				.attr('d', lineData)
				.attr('transform', `translate(${margin}, ${margin})`)
				.attr('fill', 'none')
				.style('stroke-width', '2px')
				.style('stroke', 'black');

			const points = select(svgContainer)
				.select('.chartBody')
				.append('g')
				.selectAll('circle')
				.data(chartState.data.data)
				.join('circle')
				.attr('cx', function (d, i) {
					return xScale(d[xField]);
				})
				.attr('cy', function (d, i) {
					return yScale(d[yField]);
				})
				.attr('r', 5)
				.attr('transform', `translate(${margin}, ${margin})`);

			//configure interactivity
			points
				.on('mouseover', function (event, d) {
					select(this).attr('stroke-width', '1px').attr('stroke', 'white');
				})
				.on('mousemove', function (event, d) {
					const pointPos = event.target.getBoundingClientRect();
					enable({ top: pointPos.top, left: pointPos.left });
					const xDateValues = getMonthYear(d[xField]);
					tooltipDisplay.label = yField;
					tooltipDisplay.x = xDateValues;
					tooltipDisplay.y = d[yField];
				})
				.on('mouseout', function (event, d) {
					disable();
					select(this).attr('stroke-width', '0');
				});

			linePaths[yField] = linePath;
			linePoints[yField] = points;
		}
	};

	const loadChart = () => {
		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);
		xScale = generateXDateScale(svgContainer, minX, maxX, margin);

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

		drawLines();
	};

	//resizing util funcs
	const resizeAxis = () => {
		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);
		xScale = generateXDateScale(svgContainer, minX, maxX, margin);

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
		const fields = [...chartState.data.fields];
		const xField = fields.shift();

		for (let yField of fields) {
			linePoints[yField]
				.transition()
				.attr('cx', function (d, i) {
					return xScale(d[xField]);
				})
				.attr('cy', function (d, i) {
					return yScale(d[yField]);
				})
				.attr('transform', `translate(${margin}, ${margin})`);
		}
	};

	const resizeLine = () => {
		const fields = [...chartState.data.fields];
		const xField = fields.shift();

		for (let lineKey of fields) {
			const lineData = line()
				.x((d, i) => xScale(d[xField]))
				.y((d, i) => yScale(d[lineKey]));

			linePaths[lineKey].transition().attr('d', lineData);
		}
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

	$: {
		if (chartState?.svgContainer) {
			svgContainer = chartState.svgContainer;
		}
	}

	$: chartState?.svgContainer && chartState?.chartContainer && loadChart();
</script>

<SvgContainer
	{chartStateDispatch}
	{resizeFunc}
	{tooltipState}
	{margin}
	onIWHover={(xMousePos) => {
		const invertedPos = xScale.invert(xMousePos);
		const dataIndex = bisector((d) => d.date || d.Date).center(chartData.data, invertedPos);
	}}
>
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

<style>
	.tooltip-label {
		margin: 0;
		margin-bottom: 0.4em;
	}

	.tooltip-body {
		margin: 0;
	}
</style>
