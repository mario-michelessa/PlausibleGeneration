<script>
	import { onMount } from 'svelte';
    import 'bootstrap/dist/css/bootstrap.min.css';

	let mousePosition = { x: 0, y: 0 };

	const simPath = 'docs/assets/distances/t10_0.csv'

// ------------I/O
	const realFolder = 'docs/assets/real_images/';
	let realPaths = [];
	
	const generatedFolder = 'docs/assets/generated_images/';
	let generatedPaths = [];
	
	const simMatrix = [];

	const loadRealImages = async () => {
		const response = await fetch('docs/assets/real_images/manifest.json');
		const manifest = await response.json();
		realPaths = manifest.map((fileName, index) => ({
			path: `${realFolder}${fileName}`, 
			index, 
			tag:'',
			type: fileName.includes("mel") ? 'cancer' : 'benign' }));
	};
	const splitListsCancer = async (list) => {
		let cancer = [];
		let benign = [];
		list.forEach((image) => {
			if (['mel'].includes(image.path)) {
				cancer.push(image);
			} else {
				benign.push(image);
			}
		});
		return [cancer, benign];
	};
	const loadGeneratedImages = async () => {
		const response = await fetch('docs/assets/generated_images/manifest.json');
		const manifest = await response.json();
		generatedPaths = manifest.map((fileName, index) => ({ 
			path: `${generatedFolder}${fileName}`, 
			index,
			tag:'',
			type: fileName.includes("mel") ? 'cancer' : 'benign' }));
	};
	const loadSimMatrix = async () => {
  		try {
			const csvFilePath = simPath;
			const response = await fetch(csvFilePath);
			const csvData = await response.text();
			
			const rows = csvData.split('\n');

			rows.forEach((row) => {
				const values = row.split(', ');
				const numericValues = values.map((value) => parseFloat(value));
				simMatrix.push(numericValues);
			});
		} catch (error) {
			console.error('Error loading distance matrix:', error);
		}
	};
	const createCsv = () => { 
		loadLabels();
		let labels = [...generatedPaths, ...fakePaths.map((image) => ({...image, tag: image.tag+', fake'}))];
		labels = labels.sort((a, b) => a.index - b.index);
		const csvContent = labels.map(image => [image.index, image.path, image.tag].join(',')).join('\n');
		return csvContent;
	};
	const downloadLabels = () => {

		// let labels = [...generatedPaths, ...fakePaths.map((image) => ({...image, tag: image.tag+',fake'}))];
		// labels = labels.sort((a, b) => a.index - b.index);
		// const json = JSON.stringify(labels);
		// const blob = new Blob([json], { type: 'text/json' });

		const blob = new Blob([createCsv()], { type: 'text/csv' });

		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'feedback.csv';
		link.click();
		URL.revokeObjectURL(url);
	}
// ------------LOCAL STORAGE
	const storeLocalStorage = () => {
		console.log("store")
		localStorage.setItem('generatedPaths', JSON.stringify(generatedPaths));
		localStorage.setItem('fakePaths', JSON.stringify(fakePaths));
	}
	const loadLabels = () => {
		console.log("load")
		const genPathsJSON = localStorage.getItem('generatedPaths');
		const loadedGen = [];
		if (genPathsJSON) {
			const genPathsTemp = JSON.parse(genPathsJSON);
			genPathsTemp.forEach((image) => {
				loadedGen.push({ ...image, index: parseInt(image.index) });
			});
			generatedPaths = loadedGen;
		}	
		const fakePathsJSON = localStorage.getItem('fakePaths');
		const loadedFake = [];
		if (fakePathsJSON) {
			const fakePathsTemp = JSON.parse(fakePathsJSON);
			fakePathsTemp.forEach((image) => {
				loadedFake.push({ ...image, index: parseInt(image.index) });
			});
			fakePaths = loadedFake;
		}
	}
// ------------TAGGING
	let showTag = false;
	let selectedTag = '';
  	let tags = [];
	let taggedImages = [];

	const addTag = () => {
		//selectedTag contains the text input from the user
		if (selectedTag) {
			tags = [...tags, selectedTag];
			console.log(tags);
			selectedTag = '';
		}
  	};
	const updateTag = (panel, index, tag) => {
		if (panel === 'generated'){
			generatedPaths = generatedPaths.map((image) =>
				image.index === index ? { ...image, tag: tag } : image
			);
			taggedImages = [...getTagIndexes(generatedPaths)]
			storeLocalStorage();
		} 
	};
	const getTagIndexes = (images, tag) => {
		//returns the list of indexes of images of tag
    	return images.filter((image) => image.tag === tag).map((image) => image.index);
	};
	const showTagMenu = (event, index) => {
		mousePosition = { x: event.clientX, y: event.clientY };
		if (selectedIndex === index) {
			showTag = true;
			} 
		else {
			showTag = true;
			showMenuGen = false;
		}
		selectedIndex = index;
	};
	let decisionTree = {
	  isGood: null,
	  category: null,
	};
	const handleFirstLevelChoice = (isGood) => {
	  decisionTree.isGood = isGood;
	};
	const handleSecondLevelChoice = (category) => {
	  decisionTree.category = category;
	};
	

	let dragStartIndex = null;
	let dragTag = '';

	 const dragStartTag = (event, index, tag) => {	
		// event.preventDefault();
		dragStartIndex = index;
		dragTag = tag;
		// console.log(dragStartIndex, dragTag, index, tag)
	};
	const dragEnterTag = (event, index) => {
		event.preventDefault();
		if (dragStartIndex !== null) {
			// console.log(dragStartIndex, dragTag, index)
			updateTag('generated', index, dragTag);
		}
	};
	const dragDropTag = (event) => {
		event.preventDefault();
		dragStartIndex = null;
		dragTag = '';
	};
	
// ------------SELECTION

	let selectedIndex = null;
	let selectedPanel = null;
	
	const selectImage = (panel, index) => { // changes the selected attribute in the image array
		selectedIndex = index;
		selectedPanel = panel;
	};
	const handleGenImageClick = (event, index, tag) => {
		selectImage('generated', index);
		showTagMenu(event, index);
	};
	const handleRealImageClick = (event, index) => {
		selectImage('real', index);
	};
// ------------SORTING
	let showMenuGen = false;
	let showMenuReal = false;
	const showContextMenu = (event, panel, index) => {
			event.preventDefault();
			mousePosition = { x: event.clientX, y: event.clientY };
			
			if (selectedIndex === index) {
				// Clicked on the same image again, toggle menu
				if (panel === 'real') {
					showMenuReal = !showMenuReal;
				} else if (panel === 'generated') {
					showMenuGen = !showMenuGen;
				}
				} else {
				// Clicked on a different image, show menu for that image
				showMenuReal = panel === 'real';
				showMenuGen = panel === 'generated';
			}
			selectedIndex = index;
	};
	const shuffleImages = (panel) => {
		if (panel === 'real') {
			realPaths = realPaths.sort(() => Math.random() - 0.5);
		} 
		else if (panel === 'generated') {
			generatedPaths = generatedPaths.sort(() => Math.random() - 0.5);
		}
	};
	const resetImages = (panel) => {
		if (panel === 'real') {
			realPaths = realPaths.sort((a, b) => a.index - b.index);
		} 
		else if (panel === 'generated') {
			generatedPaths = generatedPaths.sort((a, b) => a.index - b.index);
		}
	};
	const sortImages = (panel) => {
		const sim = simMatrix[selectedIndex];
		// console.log(simMatrix[selectedIndex])
		if (panel === 'real') {
			realPaths = realPaths.sort((a, b) => sim[a.index] - sim[b.index]);
		} 
		else if (panel === 'generated') {
			generatedPaths = generatedPaths.sort((a, b) => sim[b.index] - sim[a.index]);
		}
		else { console.log('error: Wrong panel name in sortImages');}
  	};

// ------------SIDE MENU
	let showSideMenu = false;

	const toggleSideMenu = () => {
		showSideMenu = !showSideMenu;
	};
	
// ------------DRAG AND DROP
	let fakePaths = [];
	let dragIndex = null;
	let dragPanel = null;

	function transferItem(index, sourceList, targetList) {
		// console.log(sourceList.find(images => images.index === index))
		const indexToTransfer = sourceList.findIndex(images => images.index === index)
		targetList.push(sourceList[indexToTransfer])
		sourceList.splice(indexToTransfer, 1)
		// const transferredItem = sourceList[index];
		// sourceList = [...sourceList.slice(0, index), ...sourceList.slice(index + 1)];
		// targetList = [...targetList, transferredItem];
		

	}
	function dragStartMove(event, panel, index) {
		dragIndex = index;
		dragPanel = panel;
		// console.log(dragIndex, dragPanel)
	}
	function dragOverMove(event) {
		event.preventDefault();
	}
	function dragDropMove(event, panel) {
		// console.log(dragIndex, dragPanel, panel)
		event.preventDefault();
		if (dragPanel === 'generated' && panel === 'fake') {
			transferItem(dragIndex, generatedPaths, fakePaths);
		}
		else if (panel === 'generated' && dragPanel === 'fake') {
			transferItem(dragIndex, fakePaths, generatedPaths);
		}
		fakePaths = fakePaths; // update in display is by assignment
		generatedPaths = generatedPaths;
		storeLocalStorage();
	}

	//HIDE DISCARD PANEL

	let showDiscardPanel = true;

	const hideDiscardPanel = () => {
		showDiscardPanel = !showDiscardPanel;
	};
//-----------------SWITCH DRAG MODES
	
	let dragMode = false;
	const switchDragMode = () => {
		dragMode = !dragMode;
	}
	const handleDragStart = (event, panel, index, tag) => {
		if (dragMode) {
			// console.log('drag start tag')
			dragStartTag(event, index, tag);
		}
		else {
			// console.log('drag start move')
			dragStartMove(event, panel, index);
		}
	};
	const handleDragEnter = (event, index) => {
		if (dragMode) {
			// console.log('drag enter tag', index)
			dragEnterTag(event, index);
		}
	};
	const handleDragOver = (event) => {
		if (!dragMode)  {
			// console.log('drag over move')
			dragOverMove(event);
		}
	};
	const handleDrop = (event, panel) => {
		if (dragMode) {
			// console.log('drag drop tag')
			dragDropTag(event);
		}
		else {
			// console.log('drag drop move')
			dragDropMove(event, panel);
		}
	};

//-----------------CLICK OUTSIDE MENU
	const handleClickOutside = (event) => {
		// Check if the click event occurred outside the contextual menu
		const isOutsideMenu = !event.target.closest('.context-menu');
		const isOutsideTagMenu = !event.target.closest('.grid-item');
		// If the click event occurred outside the menu, hide the menu
		if (isOutsideMenu) {
			showMenuGen = false;
			showMenuReal = false;
		}
		if (isOutsideTagMenu) {
			showTag = false;
		}
  	};
//-----------------ZOOM
	// let imageSize = "100px"
	// const zoomOutButton = () => {
	// 	imageSize = (imageSize === "100px") ? "20px" : "100px"; // This is your JavaScript variable
	// };
// ------------INIT
	onMount(async () => {
		window.addEventListener('click', handleClickOutside);		
		await Promise.all([loadRealImages(), loadGeneratedImages(), loadSimMatrix()]);
		// Clean up the event listener on component unmount
		// loadLabels();
		return () => {
		  window.removeEventListener('click', handleClickOutside);
		};
	});

</script>

<div class="App">

	{#if !showSideMenu}
	<div class="menu">
		<button class="btn btn-primary" on:click={toggleSideMenu}>Menu</button>
	</div>
	{:else}
	<div class="side-menu">
		<h2>Menu</h2>
		<hr>
		<div class="btn-group-vertical"> 
			<button class="btn btn-sm btn-primary" 	 on:click={toggleSideMenu}>Back</button><br/>
			<button class="btn btn-sm btn-secondary">Regenerate</button><br/>
			<button class="btn btn-sm btn-secondary" on:click={downloadLabels}>Download Labels</button><br/>
			<button class="btn btn-sm btn-secondary" on:click={loadLabels}>Load Labels</button><br/>
			{#each tags as tag}
				<button>{tag}</button><br/>
			{/each}
		</div>
	</div>
	{/if}

	<div class="panel container">
		<!-- <button class="zoom-button btn btn-sm btn-secondary" on:click={zoomOutButton}>
			Zoom out
		</button> -->
		<h2 class="top-panel">Real Images</h2>
		<hr>
		<div class="btn-group button-bar top-panel" >
			<button class="btn btn-sm btn-secondary" on:click={() => sortImages('real')}>Sort Real Images by similarity with the selected image</button>
			<button class="btn btn-sm btn-secondary" on:click={() => shuffleImages("real")}>Shuffle Real Images</button>
			<button class="btn btn-sm btn-secondary" on:click={() => resetImages("real")}>Reset Images Order</button>
		</div>
		<hr>
		<div class="image-grid">
			{#each realPaths as { path, index, tag, type } (path)}
			{#if type === 'benign'}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="grid-item">
				<div class="image-number"> {index} </div>
				<img src={path} 
					alt={path} 
					class="panel-image" class:selected={selectedIndex == index && selectedPanel == 'real' } 
					on:click={(e) => handleRealImageClick(e, index)}
					/>
			</div>
			{/if}
			{/each}
		</div>
		<hr>
		<div class="image-grid cancer">
			{#each realPaths as { path, index, tag, type} (path)}
			{#if type === 'cancer'}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="grid-item">
				<div class="image-number"> {index} </div>
				<img src={path} 
					alt={path} 
					class="panel-image img-rounded" class:selected={selectedIndex == index && selectedPanel == 'real'} 
					on:click={(e) => handleRealImageClick(e, index)}
					/>
			</div>
			{/if}
			{/each}
		</div>
	</div>
	
	<div class="panel"
		on:drop={(e) => handleDrop(e, "generated")}
		on:dragover={(e) => handleDragOver(e)}
		>
		<!-- <button class="zoom-button btn btn-sm btn-secondary" on:click={zoomOutButton}>
			Zoom out
		</button> -->
		<!-- {#if !showDiscardPanel}
		<div class="close-button">
			<button class = "btn btn-primary"on:click={hideDiscardPanel}>Discard Panel</button>
		</div>
		{/if} -->
		<h2 class=top-panel>Generated Images</h2>
		<hr>
		<div class="btn-group button-bar top-panel" >
			<!-- <button on:click={() => sortImages('real', null)}>Sort Real Images</button> -->
			<button class="btn btn-sm btn-secondary" on:click={() => sortImages('generated')}>Sort Generated Images by similarity with the selected image</button>
			<button class="btn btn-sm btn-secondary" on:click={() => shuffleImages("generated")}>Shuffle Generated Images</button>
			<button class="btn btn-sm btn-secondary" on:click={() => resetImages("generated")}>Reset Images Order</button>
			<button class="btn btn-sm btn-secondary" on:click={switchDragMode} class:triggered={dragMode}>Fast tagging mode</button>

		</div>
		<hr>
		<div class="image-grid">
			{#each generatedPaths as { path, index, tag, type } (path)}
			{#if type === 'benign'}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- button for drag and drop -->
			<div class="grid-item" 
					class:draggable={!dragMode}
					on:click={(e) => handleGenImageClick(e, index, tag)}
					draggable="true"
					on:dragstart={(e) => handleDragStart(e, "generated", index, tag)}
					on:dragenter={(e) => handleDragEnter(e, index)}
					
					>	
				<!-- <button class="circle-button" on:click={(e) => handleCircleButtonClick(e, 'generated', index)}></button> -->
				<div class="image-number"> {index} </div>
				<img src={path} 
					alt={path}  
					class="panel-image" 
					class:selected={selectedIndex == index && selectedPanel == 'generated'} 
					class:tagged={tag !== '' && (selectedIndex !== index || selectedPanel !== 'generated')} 
					/>
				<div class="tag-text">{tag}</div>

				{#if showTag && selectedIndex === index}

					<div class="tag-menu">
						{#each tags as tag}
							<button on:click = {() => updateTag('generated', index, tag)}>{tag}</button><br/>
						{/each}
						<input
							type="text"
							placeholder="Tag"
							bind:value={selectedTag}
							on:input={() => {}}
							on:keydown={(e) => {
							if (e.key === 'Enter') {
								addTag();
							}
							}}
							class="add-tag"
						/>
						<button on:click={() => addTag()}>Save Tag</button>
					</div> 
					<!-- <div class="decision-tree">
						<div class="decision-tree-level">
							<div class="decision-tree-level-label">Is the image good?</div>
							<button class="decision-tree-button" on:click={() => handleFirstLevelChoice(true)}>Yes</button>
							<button class="decision-tree-button" on:click={() => handleFirstLevelChoice(false)}>No</button>
						</div> -->
						<!-- {#if decisionTree.isGood !== null}
							<div class="decision-tree-level">
								<div class="decision-tree-level-label">Category:</div>
								<input type="checkbox" class="decision-tree-button" on:click={() => handleSecondLevelChoice('1')}/>Shape<br/>
								<input type="checkbox" class="decision-tree-button" on:click={() => handleSecondLevelChoice('2')}>Color<br/>
								<input type="checkbox" class="decision-tree-button" on:click={() => handleSecondLevelChoice('3')}>Texture<br/>
							</div>
						{/if} 
					</div>-->
				{/if}
			</div>
			{/if}
			{/each}
		</div>
		<hr>
		<div class="image-grid cancer">
			{#each generatedPaths as { path, index, tag, type } (path)}
			{#if type === 'cancer'}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- button for drag and drop -->
			<div class="grid-item" 
					class:draggable={!dragMode}
					on:click={(e) => handleGenImageClick(e, index, tag)}
					draggable="true"
					on:dragstart={(e) => handleDragStart(e, "generated", index, tag)}
					on:dragenter={(e) => handleDragEnter(e, index)}
					
					>	
				<!-- <button class="circle-button" on:click={(e) => handleCircleButtonClick(e, 'generated', index)}></button> -->
				<div class="image-number"> {index} </div>
				<img src={path} 
					alt={path}  
					class="panel-image" 
					class:selected={selectedIndex == index && selectedPanel == 'generated'} 
					class:tagged={tag !== '' && (selectedIndex !== index || selectedPanel !== 'generated')} 
					/>
				<div class="tag-text">{tag}</div>

				{#if showTag && selectedIndex === index}

					<div class="tag-menu">
						{#each tags as tag}
							<button on:click = {() => updateTag('generated', index, tag)}>{tag}</button><br/>
						{/each}
						<input
							type="text"
							placeholder="Tag"
							bind:value={selectedTag}
							on:input={() => {}}
							on:keydown={(e) => {
							if (e.key === 'Enter') {
								addTag();
							}
							}}
							class="add-tag"
						/>
						<button on:click={() => addTag()}>Save Tag</button>
					</div> 
				{/if}
			</div>
			{/if}
			{/each}
		</div>
	</div>

	{#if showDiscardPanel}
	<div class="panel fake-panel"
		on:dragover={(e) => handleDragOver(e)}
		on:drop={(e) => handleDrop(e, "fake")}>
		
		<!-- svelte-ignore a11y-click-events-have-key-events -->
			
		<!-- <button class="zoom-button btn btn-sm btn-secondary" on:click={zoomOutButton}>
			Zoom out
		</button> -->
		
		<div class="top-panel">
			<h2 class="fake-title">Fake Images</h2>
			<hr>
			<div class="btn-group button-bar" >

				<button class="btn btn-sm btn-secondary" on:click={() => sortImages('fake')}>Sort Fake Images by similarity with the selected image</button>
				<button class="btn btn-sm btn-secondary" on:click={() => shuffleImages("fake")}>Shuffle Fake Images</button>
				<button class="btn btn-sm btn-secondary" on:click={() => resetImages("fake")}>Reset Images Order</button>
			</div>
		</div>
		<hr>
		<div class="image-grid">
			{#each fakePaths as { path, index, tag, type } (path)}
			{#if type === 'benign'}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- <div class="grid-item" 
					on:click={(e) => handleGenImageClick(e, index, tag)}
			> -->
			<div class="grid-item" 
					on:click={(e) => handleGenImageClick(e, index, tag)}
					draggable="true"
					on:dragstart={(e) => handleDragStart(e, "generated", index)}
					>

				<div class="image-number"> {index} </div>
				<img src={path} 
					alt={path}  
					class="panel-image"
					/>
				<div class="tag-text">{tag}</div>
				{#if showTag && selectedIndex === index}

					<div class="tag-menu">
						{#each tags as tag}
							<button on:click = {() => updateTag('fake', index, tag)}>{tag}</button><br/>
						{/each}
						<input
							type="text"
							placeholder="Tag"
							bind:value={selectedTag}
							on:input={() => {}}
							on:keydown={(e) => {
							if (e.key === 'Enter') {
								addTag();
							}
							}}
							class="add-tag"
						/>
						<button on:click={() => addTag()}>Save Tag</button>
					</div> 
				{/if} 
				</div>
			{/if}
			{/each}
		</div>
		<hr>
		<div class="image-grid cancer">
			{#each fakePaths as { path, index, tag, type } (path)}
			{#if type === 'cancer'}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- <div class="grid-item" 
					on:click={(e) => handleGenImageClick(e, index, tag)}
			> -->
			<div class="grid-item" 
					on:click={(e) => handleGenImageClick(e, index, tag)}
					draggable="true"
					on:dragstart={(e) => handleDragStart(e, "generated", index)}
					>

				<div class="image-number"> {index} </div>
				<img src={path} 
					alt={path}  
					class="panel-image"
					/>
				<div class="tag-text">{tag}</div>
				{#if showTag && selectedIndex === index}

					<div class="tag-menu">
						{#each tags as tag}
							<button on:click = {() => updateTag('fake', index, tag)}>{tag}</button><br/>
						{/each}
						<input
							type="text"
							placeholder="Tag"
							bind:value={selectedTag}
							on:input={() => {}}
							on:keydown={(e) => {
							if (e.key === 'Enter') {
								addTag();
							}
							}}
							class="add-tag"
						/>
						<button on:click={() => addTag()}>Save Tag</button>
					</div> 
				{/if} 
				</div>
			{/if}
			{/each}
		</div>
	</div>
	{/if}
	
</div>
  

<style>

	.App {
		text-align: center;
		display: flex;
	}
/* PANELS */
	.panel {
		/* align-items: center; */
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		padding: 10px;
		height: 100vh;
		/* border:1px solid black; */
		/* overflow-y: auto; */
	}
	.fake-panel {
		background-color: rgba(255, 0, 0, 0.215);
	}
	.top-panel { 
		flex:0;
		/* position:sticky; */
	}
	.fake-title {
		color: #831b1b;
	}
	hr {
		margin: 5px 0; /* Adjust the top and bottom margin to reduce space */
		border: 0; /* Remove the default border to hide the line */
		border-top: 1px solid #ccc; /* Add a new top border to create a thinner line */
		}
	h2 {
		margin: 0;
		font-size: 1.2rem;
	}
/* BUTTONS */
	button {
		font-size: small;
	}
	.zoom-button {
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
	}
	.triggered { 
		background-color: #573b3b;
	}
/* IMAGE GRID */
	.image-grid {
		/* flex-grow: 1; */
		flex: 1;
		padding: 0px;
		display: grid;	

		/* grid-template-columns: repeat(3, 1fr); Adjust the number of columns as needed */
		grid-template-columns: repeat(auto-fit,  100px); /*minmax(110px, 1fr)); */
		grid-gap: 3px;
		/* height: 80%; */
		overflow-y: auto;
	}
	.image-grid.cancer { 
		background-color: rgba(255, 0, 0, 0.215);
		border: #a46666 1px solid;
		max-height: 200px;
	}
	.image-grid::-webkit-scrollbar {
		width: 0px;
	}
	.grid-item{
		position: relative;
		width: fit-content;
		height: fit-content;
		display: inline-block;
		margin: 0px;
	}
	.image-number {
		position: absolute;
		top: 5px;
		left: 5px;
		background-color: rgba(255, 255, 255, 0.8);
		padding: 2px 5px;
		font-size: 10px;
		font-weight: 200;
	}
	.panel-image {
		width:100px;
		height:100px;
		/* width : var(--size);
		height : var(--size); */
	}
	.panel-image.selected {
		border: 2px solid rgb(75, 112, 225);
	}
	.panel-image.tagged {
		border: 5px solid rgba(255, 141, 35, 0.7);
	}
/* MENUS */
	.context-menu {
		position: absolute;
		background-color: white;
		padding: 10px;
		border: 1px solid black;
		z-index: 1000;
	}
	.menu {    
		position: fixed;
		top: 5px;
		left: 5px;
		z-index: 1000;
		background-color: #eee;
		padding: 5px;
		border-radius: 5px;
	}
	.side-menu {
		background-color: #fff;
		padding: 10px;
		border-radius: 5px;
	}
/* TAGS */
	.tag-menu {
		position: absolute;
		background-color: white;
		padding: 10px;
		border: 1px solid black;
		z-index: 500;
	}
	.tag-text {
		position: absolute;
		bottom: 5px;
		left: 5px;
		background-color: rgba(255, 255, 255, 0.8);
		padding: 2px 5px;
		font-size: 10px;
	}
	.decision-tree {
		position:absolute;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-bottom: 10px;
		background-color: #EEFFEE;
		z-index: 1000;
	}
	.decision-tree-level {
		display: flex;
		align-items: center;
		margin-bottom: 5px;
	}
	.decision-tree-level-label {
		margin-right: 10px;
	}
	.decision-tree-button {
		margin-right: 5px;
	}
	.draggable { 
		cursor:grab;
	}
</style>