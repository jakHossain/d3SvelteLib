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
	import Treemap from '../lib/components/charts/Treemap.svelte';

	let predictionLineData;
	let multLineSeriesData;
	let candidate_data;
	let salesSingleBarData;
	let groupedBarData;
	let hierarchyData;

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
		hierarchyData = await loadCsvData('../src/assets/hierarchy.csv');

		multLineSeriesData.data = multLineSeriesData.data.map((item) => {
			const convData = new Date(item.date);
			return { ...item, date: convData };
		});

		candidate_data = await loadCsvData('../src/assets/candidate_data.csv');
	});
</script>

<main>
	<!-- {#if multLineSeriesData}
		<LineChart chartData={multLineSeriesData}></LineChart>
	{/if} -->
	{#if salesSingleBarData}
		<ColumnChart chartData={salesSingleBarData} maxY={200} />
	{/if}
	{#if groupedBarData}
		<GroupedColumnChart chartData={groupedBarData} />
	{/if}
	{#if candidate_data}
		<PollChart chartData={candidate_data}></PollChart>
	{/if}

	{#if hierarchyData}
		<Treemap chartData={hierarchyData} />
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
		gap: 2rem;
	}
</style>
