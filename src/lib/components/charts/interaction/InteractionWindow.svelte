<script>
	export let svgDivContainer;
	export let margin;
	export let vTooltip = true;

	let interactionWindowRef;
	let vTooltipRef;
	console.log('Interaction Window', svgDivContainer, margin);
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={interactionWindowRef}
	class="interaction-window"
	style={`width: calc(100% - ${margin * 2}px); height: calc(100% - ${margin * 2}px); transform: translate(${margin}px, ${margin}px)`}
	on:mousemove={(event) => {
		if (event.target == interactionWindowRef) {
			vTooltipRef.style.display = 'inline-block';
			console.log(event);
			vTooltipRef.style.left = event.layerX + 'px';
		}
	}}
	on:mouseleave={() => {
		vTooltipRef.style.display = 'none';
	}}
>
	{#if vTooltip}
		<span class="vertical-tooltip" bind:this={vTooltipRef}></span>
	{/if}
</div>

<style>
	.interaction-window {
		position: absolute;
		left: 0;
		top: 0;
		background-color: greenyellow;
		z-index: 1;
	}
	.vertical-tooltip {
		display: none;
		box-sizing: border-box;
		height: 100%;
		width: 2px;
		position: absolute;
		left: 200px;
		border-right: solid 2px black;
		z-index: -1;
	}
</style>
