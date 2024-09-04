<script>
	//these imports are based off if this code is run from /charts
	import { onDestroy, onMount } from 'svelte';
	import { max, scaleBand, scaleLinear, select, axisBottom, axisLeft, pointer, extent } from 'd3';

	import { initializeToolTip } from './interaction/TooltipUtility';
	import SvgContainer from '../chartElements/SvgContainer.svelte';
	import { initChartData } from '../../stores/ChartStore';
	import {
		resizeDebounce,
		generateBandXScale,
		generateLinearYScale
	} from '../../utilities/ChartUtil';

	export let chartData;
	export let margin = 25;
	export let minY = 0;
	export let maxY = 100;

	//chart body variables
	let svgContainer;
	let bandScale;
	let yScale;
	let xAxis;
	let yAxis;
	let bands;
	let dataFields = { column: '', value: '' };
	let bars;

	//chart state configuration
	let chartState;
	let tooltipState;
	const tooltipDisplay = { [dataFields.column]: '', [dataFields.value]: '' };

	const [subscribeChartState, chartStateDispatch] = initChartData();
	const unsubscribeChartState = subscribeChartState((state) => {
		chartState = state;
	});

	const { subscribeTooltip, enable, disable } = initializeToolTip();

	const unsubscribeTooltip = subscribeTooltip((state) => {
		tooltipState = state;
	});

	//func to take in JSON'd CSV data (which is passed in as chartData), do any specific chart-type cleaning here before hooking onto chartState;
	const processCsvData = (chartData) => {
		chartStateDispatch.setChartData(chartData);

		//for objective reference for x/y variables
		[dataFields.column, dataFields.value] = chartData.fields;

		//evaluate min and max
		if (!minY || !maxY) {
			const [min, max] = extent(chartData.data, (d) => d[dataFields.value]);
			console.log();

			if (!minY && minY < 0) minY = min;

			if (!maxY) maxY = max;
		}
	};

	//function to draw chart, put initial scale defining logic here. Can add chart drawing utility functions here as well for refactoring (recommended)
	const loadChart = () => {
		processCsvData(chartData);
		bands = chartState.data.data.map((item) => item[dataFields.column]);

		bandScale = generateBandXScale(svgContainer, bands, 0.2, margin);

		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);

		bars = select(svgContainer)
			.select('.chartBody')
			.append('g')
			.selectAll('rect')
			.data(chartState.data.data)
			.join('rect')
			.attr('x', function (d, i) {
				return bandScale(d[dataFields.column]);
			})
			.attr('y', (d) => yScale(d[dataFields.value]))
			.attr('width', bandScale.bandwidth()) // Bar width based on scaleBand
			.attr(
				'height',
				(d) => svgContainer.getBoundingClientRect().height - margin * 2 - yScale(d.sales)
			)
			.attr('transform', `translate(${margin}, ${margin})`)
			.attr('fill', 'steelblue');

		bars.on('mouseenter', function (event, d) {
			select(this).attr('opacity', 0.8);
		});

		bars.on('mousemove', function (event, d) {
			enable({ top: event.clientY, left: event.clientX });
			tooltipDisplay[dataFields.column] = d[dataFields.column];
			tooltipDisplay[dataFields.value] = d[dataFields.value];
		});

		bars.on('mouseout', function (event, d) {
			select(this).attr('opacity', 1);
			disable();
		});

		xAxis = select(svgContainer)
			.select('.x-axis')
			.call(axisBottom(bandScale))
			.attr(
				'transform',
				`translate(${margin}, ${svgContainer.getBoundingClientRect().height - margin})`
			);

		yAxis = select(svgContainer)
			.select('.y-axis')
			.call(axisLeft(yScale))
			.attr('transform', `translate(${margin}, ${margin})`);
	};

	//resizing utility functions should be defined here before called in resizeFunc; debouncedResizer is what actually be called (for performance improvements)

	const resizeBars = () => {
		bars
			.transition()
			.attr('x', function (d, i) {
				return bandScale(d[dataFields.column]);
			})
			.attr('y', (d) => yScale(d[dataFields.value]))
			.attr('width', bandScale.bandwidth()) // Bar width based on scaleBand
			.attr(
				'height',
				(d) => svgContainer.getBoundingClientRect().height - margin * 2 - yScale(d.sales)
			)
			.attr('transform', `translate(${margin}, ${margin})`);
	};

	const resizeFunc = () => {
		bandScale = generateBandXScale(svgContainer, bands, 0.2, margin);
		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);

		xAxis
			.transition()
			.call(axisBottom(bandScale))
			.attr(
				'transform',
				`translate(${margin}, ${svgContainer.getBoundingClientRect().height - margin})`
			);

		yAxis.transition().call(axisLeft(yScale)).attr('transform', `translate(${margin}, ${margin})`);

		resizeBars();
	};
	const debouncedResizer = resizeDebounce(resizeFunc, 100);

	onMount(() => {
		if (typeof window != 'undefined') {
			window.addEventListener('resize', debouncedResizer);
		}
	});

	onDestroy(() => {
		if (typeof window != 'undefined') {
			window.removeEventListener('resize', debouncedResizer);
		}
		unsubscribeTooltip();
		unsubscribeChartState();
	});

	//bind svgContainer to svgContainer that's in state (that was linked up by passing chartStateDisptach to the SvgContianer component)
	$: {
		if (chartState?.svgContainer) {
			svgContainer = chartState.svgContainer;
		}
	}

	//renders chart only when all important components are defined
	$: svgContainer && chartState?.chartContainer && loadChart();
</script>

<SvgContainer {chartStateDispatch} {resizeFunc} {tooltipState} {margin}>
	<span slot="chartTitle"
		>Column Chart: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<span slot="chartDeck"
		>Chart deck: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<div slot="tooltipOutput">
		<h5 class="tooltip-label">{tooltipDisplay[dataFields.column]}</h5>
		<p class="tooltip-body">{`${dataFields.value}: ${tooltipDisplay[dataFields.value]}`}</p>
	</div>
</SvgContainer>

<style>
	.tooltip-label {
		margin: 0.5em 0;
		font-size: 1.2rem;
	}

	.tooltip-body {
		font-size: 1rem;
		margin: 0;
	}

	.tooltip-body strong {
		font-size: 1rem;
		margin: 0;
	}
</style>
