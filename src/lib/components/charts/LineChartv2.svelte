<script>
	import { onMount, onDestroy } from 'svelte';
	import SvgContainer from '../chartElements/SvgContainer.svelte';

	let chartContainerRef;
	let svgRef;
</script>

<SvgContainer {chartContainerRef} {svgRef}>
	<span slot="chartTitle"
		>Chart title: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
	<span slot="chartDeck"
		>Chart deck: lorem ipsum dolor sit amet consectetur adipisicing elit ipsa error natus</span
	>
</SvgContainer>

<button
	on:click={() => {
		console.log(svgRef);
	}}
	>asdsad
</button>
