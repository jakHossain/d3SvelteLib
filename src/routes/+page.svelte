<script>
	import LineChart from '../lib/components/charts/LineChart.svelte';
	import Scatter from '../lib/components/charts/Scatter.svelte';
	import { onMount } from 'svelte';
	import { readCsv } from '../lib/utilities/CSVParsingUtil';
	import PollChart from '../lib/components/charts/PollChart.svelte';
	import { getMaxFromArray, getMinFromArray } from '../lib/utilities/ChartUtil';
	import { groups } from 'd3';
	import ColumnChart from '../lib/components/charts/ColumnChart.svelte';
	import GroupedColumnChart from '../lib/components/charts/GroupedColumnChart.svelte';

	let predictionLineData;
	let multLineSeriesData;
	let candidate_data;
	let salesSingleBarData;
	let groupedBarData;

	let data = [
		{ x: 0, y: 4, label: 'A' },
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

	const loadCsvData = async (csvUrl) => {
		const csvData = await (await fetch(csvUrl)).text();
		const data = await readCsv(csvData);

		return data;
	};
	onMount(async () => {
		predictionLineData = await loadCsvData('../src/assets/poll_data.csv');
		multLineSeriesData = await loadCsvData('../src/assets/multLineSeries.csv');
		salesSingleBarData = await loadCsvData('../src/assets/salesSingleBar.csv');
		groupedBarData = await loadCsvData('../src/assets/groupedCol.csv');

		multLineSeriesData.data = multLineSeriesData.data.map((item) => {
			const convData = new Date(item.date);
			return { ...item, date: convData };
		});

		candidate_data = await loadCsvData('../src/assets/candidate_data.csv');
	});
</script>

<main>
	<!-- <LineChart margin={50} {data} /> -->
	<!-- {#if predictionLineData}
		<PollChart data={predictionLineData.data} margin={50} />
	{/if} -->
	<!-- {#if multLineSeriesData}
		<LineChart chartData={multLineSeriesData}></LineChart>
	{/if} -->
	{#if candidate_data}
		<PollChart chartData={candidate_data}></PollChart>
	{/if}
	{#if salesSingleBarData}
		<ColumnChart chartData={salesSingleBarData} maxY={200} />
	{/if}
	{#if groupedBarData}
		<GroupedColumnChart chartData={groupedBarData} />
	{/if}
</main>

<style>
	main {
		width: 50vw;
		height: 100vh;
		margin: auto;
		min-width: 500px;
		min-height: 250px;
		display: grid;
		grid-template-rows: 1fr 1fr 1fr;
		gap: 2rem;
	}
</style>
