<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		select,
		selectAll,
		group,
		line,
		area,
		min,
		max,
		axisBottom,
		axisLeft,
		timeFormat
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
	import { defaultColors } from '../../utilities/ChartStyleData';

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

		console.log('initial setup', chartState.data);
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
	let linePaths = {};
	let areas = {};

	const drawAreas = (candidateData, candidate, index) => {
		const lowData = candidateData.Low;
		const highData = candidateData.High;

		console.log('YO', lowData, highData);

		const areaData = area()
			.x((d, i) => xScale(lowData[i].Date))
			.y0((d, i) => yScale(lowData[i].Value))
			.y1((d, i) => yScale(highData[i].Value));

		areas[candidate] = select(svgContainer)
			.select('.chartBody')
			.append('g')
			.append('path')
			.datum(lowData)
			.attr('d', areaData)
			.attr('transform', `translate(${margin}, ${margin})`)
			.attr('fill', defaultColors[index])
			.attr('opacity', 0.2);
	};
	const drawLines = (candidateData, candidate, index) => {
		const lineData = line()
			.x((d, i) => xScale(d.Date))
			.y((d, i) => yScale(d.Value));

		linePaths[candidate] = select(svgContainer)
			.select('.chartBody')
			.append('g')
			.append('path')
			.datum(candidateData)
			.attr('d', lineData)
			.attr('fill', 'none')
			.attr('stroke-width', '2px')
			.attr('stroke', `${defaultColors[index]}`)
			.attr('transform', `translate(${margin}, ${margin})`);
	};

	const loadChart = () => {
		console.log('loading chart...');

		const data = chartState.data.data;

		console.log('WTD this', data);

		xScale = generateXDateScale(svgContainer, minX, maxX, margin);
		yScale = generateLinearYScale(svgContainer, minY, maxY, margin);

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

		Object.keys(data).forEach((candidate, index) => {
			const candidateData = data[candidate];
			drawAreas(candidateData, candidate, index);
			drawLines(candidateData.Estimate, candidate, index);
		});
	};

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

	const resizeLineAndAreaPaths = () => {
		const updateLineData = line()
			.x((d, i) => xScale(d.Date))
			.y((d, i) => yScale(d.Value));

		for (let candidate in linePaths) {
			linePaths[candidate].transition().attr('d', updateLineData);
		}

		Object.keys(chartState.data.data).forEach((candidate, index) => {
			const candidateData = chartState.data.data[candidate];

			const lowData = candidateData.Low;
			const highData = candidateData.High;

			const updatedAreaData = area()
				.x((d, i) => xScale(lowData[i].Date))
				.y0((d, i) => yScale(lowData[i].Value))
				.y1((d, i) => yScale(highData[i].Value));

			areas[candidate].transition().attr('d', updatedAreaData);
		});
	};

	const resizeFunc = () => {
		resizeAxis();
		resizeLineAndAreaPaths();
	};

	$: {
		if (chartState?.svgContainer) {
			svgContainer = chartState.svgContainer;
		}
	}

	$: svgContainer && chartState?.chartContainer && chartState?.data && loadChart();
</script>

<SvgContainer {chartStateDispatch} {resizeFunc} {tooltipState} {margin}>
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
