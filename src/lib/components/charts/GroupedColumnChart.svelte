<script>
	//these imports are based off if this code is run from /charts
	import { initializeToolTip } from './interaction/TooltipUtility';
	import SvgContainer from '../chartElements/SvgContainer.svelte';
	import { initChartData } from '../../stores/ChartStore';
	import { onDestroy, onMount } from 'svelte';
	import {
		resizeDebounce,
		generateBandXScale,
		generateLinearYScale
	} from '../../utilities/ChartUtil';
	import { axisBottom, axisLeft, max, min, scaleBand, select, selectAll } from 'd3';
	import { defaultColors } from '../../utilities/ChartStyleData';

	export let chartData;
	export let margin = 25;
	export let minY;
	export let minX;
	export let maxY;
	export let maxX;

	//chart body variables
	let svgContainer;
	let groupScale;
	let subGroupScale;
	let yScale;
	let xAxis;
	let yAxis;
	let groupKeys;
	let groupObjects;
	let subGroupBars;

	//chart state configuration
	let chartState;
	let tooltipState;
	const tooltipDisplay = { group: '', category: '', value: '' };

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
		groupKeys = chartData.fields.slice(1, chartData.fields.length);

		if (!minY) {
			minY = min(chartData.data, (d) => min(groupKeys.map((group) => d[group])));
			if (minY > 0) minY = 0;
		}

		if (!maxY) {
			maxY = max(chartData.data, (d) => max(groupKeys.map((group) => d[group])));
		}
	};

	//function to draw chart, put initial scale defining logic here. Can add chart drawing utility functions here as well for refactoring (recommended)

	const renderGroupsAndBars = () => {
		groupScale = generateBandXScale(
			svgContainer,
			chartState.data.data.map((d) => d[chartState.data.fields[0]]),
			0.2,
			margin
		);

		subGroupScale = scaleBand().domain(groupKeys).rangeRound([0, groupScale.bandwidth()]);

		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);

		groupObjects = select(svgContainer)
			.select('.chartBody')
			.append('g')
			.selectAll('g')
			.data(chartState.data.data)
			.join('g')
			.attr(
				'transform',
				(d) => `translate(${groupScale(d[chartState.data.fields[0]]) + margin} , ${margin} )`
			);

		subGroupBars = groupObjects
			.selectAll('rect')
			.data((d) =>
				groupKeys.map((group) => ({
					key: group,
					value: d[group],
					group: d[chartState.data.fields[0]]
				}))
			)
			.join('rect')
			.attr('x', (d) => subGroupScale(d.key))
			.attr('y', (d) => yScale(d.value))
			.attr('width', subGroupScale.bandwidth())
			.attr(
				'height',
				(d) => svgContainer.getBoundingClientRect().height - margin * 2 - yScale(d.value)
			)
			.attr('fill', (d, i) => defaultColors[i])
			.attr('subgroup', (d) => d.key)
			.on('mouseenter', function (event, d) {
				selectAll(`rect[subgroup="${d.key}"]`).attr('opacity', 0.5);
			})
			.on('mousemove', function (event, d) {
				enable({ top: event.clientY, left: event.clientX });
				tooltipDisplay.group = d.group;
				tooltipDisplay.value = d.value;
				tooltipDisplay.category = d.key;
			})
			.on('mouseout', function (event, d) {
				disable();
				selectAll(`rect[subgroup="${d.key}"]`).attr('opacity', 1);
			});

		xAxis = select(svgContainer)
			.select('.x-axis')
			.call(axisBottom(groupScale))
			.attr(
				'transform',
				`translate(${margin}, ${svgContainer.getBoundingClientRect().height - margin})`
			);

		yAxis = select(svgContainer)
			.select('.y-axis')
			.call(axisLeft(yScale))
			.attr('transform', `translate(${margin}, ${margin})`);
	};

	const loadChart = () => {
		processCsvData(chartData);
		renderGroupsAndBars();
	};

	//resizing utility functions should be defined here before called in resizeFunc; debouncedResizer is what actually be called (for performance improvements)

	const resizeBigGroups = () => {
		groupObjects.attr(
			'transform',
			(d) => `translate(${groupScale(d[chartState.data.fields[0]]) + margin} , ${margin} )`
		);
	};

	const resizeSubGroups = () => {
		subGroupBars
			.transition()
			.attr('x', (d) => subGroupScale(d.key))
			.attr('y', (d) => yScale(d.value))
			.attr('width', subGroupScale.bandwidth())
			.attr(
				'height',
				(d) => svgContainer.getBoundingClientRect().height - margin * 2 - yScale(d.value)
			);
	};

	const resizeFunc = () => {
		groupScale = generateBandXScale(
			svgContainer,
			chartState.data.data.map((d) => d[chartState.data.fields[0]]),
			0.2,
			margin
		);

		subGroupScale = scaleBand().domain(groupKeys).rangeRound([0, groupScale.bandwidth()]);

		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);

		xAxis
			.transition()
			.call(axisBottom(groupScale))
			.attr(
				'transform',
				`translate(${margin}, ${svgContainer.getBoundingClientRect().height - margin})`
			);

		yAxis.transition().call(axisLeft(yScale)).attr('transform', `translate(${margin}, ${margin})`);

		resizeBigGroups();
		resizeSubGroups();
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
		>Poll Chart: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<span slot="chartDeck"
		>Chart deck: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<div slot="tooltipOutput">
		<h5 class="tooltip-label">{tooltipDisplay.group}</h5>
		<p class="tooltip-body"><strong>{tooltipDisplay.category}</strong></p>
		<p class=".tooltip-body">{tooltipDisplay.value}</p>
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
