<script>
	import { onMount, onDestroy } from 'svelte';
	import { select, selectAll, group, line, min, max, axisBottom, axisLeft, timeFormat } from 'd3';
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

	const processCsvData = () => {
		// date col should be first column in CSV
		const dateCol = chartData.fields[0];

		//convert date string to datetime values
		chartData.data = chartData.data.map((item) => {
			const convertedDate = new Date(item[dateCol]);
			return { ...item, [dateCol]: convertedDate };
		});

		if (!minX || !maxX) {
			const { minVal, maxVal } = getMinMaxFromDataObject(chartData.data, [dateCol]);

			if (!minX) minX = minVal;
			if (!maxX) maxX = maxVal;
		}

		if (!minY || !maxY) {
			const { minVal, maxVal } = getMinMaxFromDataObject(chartData.data, ['Value']);

			if (!minY) minY = minVal;
			if (!maxY) maxY = maxVal;
		}

		const groupedData = group(chartData.data, (d) => d.Candidate);

		const cleanedChartData = {};

		for (const [candidate, dataArr] of groupedData) {
			const candidatePollNums = {};
			const numGroups = group(dataArr, (d) => d.Type);
			for (const [type, numArr] of numGroups) {
				candidatePollNums[type] = numArr;
			}
			cleanedChartData[candidate] = candidatePollNums;
		}
		chartStateDispatch.setChartData({
			data: cleanedChartData,
			candidates: Object.keys(cleanedChartData)
		});

		console.log(chartState.data);
	};
	processCsvData();

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

	const loadChart = () => {
		console.log('loading chart...');
	};

	const resizeFunc = () => {};

	$: {
		if (chartState?.svgContainer) {
			svgContainer = chartState.svgContainer;
		}
	}

	$: chartState?.svgContainer && chartState?.chartContainer && chartState?.data && loadChart();
</script>

<SvgContainer {chartStateDispatch} {resizeFunc} {tooltipState}>
	<span slot="chartTitle"
		>Poll Chart: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
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
