<script>
	import { onMount } from 'svelte';
  
	let showMenuReal = false;
	let showMenuGen = false;
	let showTag = false;
	let mousePosition = { x: 0, y: 0 };
	let selectedIndex = null;

	let selectedTag = '';
  	let tags = [];
	
	let selectedImages = [];
    let showSideMenu = false;

	const realFolder = 'real_images/';
	let realPaths = [];
  
	const generatedFolder = 'TI_images/';
	let generatedPaths = [];
  
	let dragStartIndex = null;
	let dragStartTag = '';
	let dragImages = [];

	const loadRealImages = async () => {
		const response = await fetch('/real_images/manifest.json');
		const manifest = await response.json();
		realPaths = manifest.map((fileName, index) => ({
			path: `${realFolder}${fileName}`, 
			index, 
			tag:''}));
	};
	const loadGeneratedImages = async () => {
		const response = await fetch('/TI_images/manifest.json');
		const manifest = await response.json();
		generatedPaths = manifest.map((fileName, index) => ({ 
			path: `${generatedFolder}${fileName}`, 
			index,
			tag:'' }));
	};
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
	const handleCircleButtonClick = (event, panel, index) => {
		event.stopPropagation();
		showContextMenu(event, panel, index);
	}
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
			selectedImages = [...getSelectedIndexes(generatedPaths)]
		} 
	};
	const getTagIndexes = (images, tag) => {
		//returns the list of indexes of images of tag
    	return images.filter((image) => image.tag === tag).map((image) => image.index);
	};
	const showTagMenu = (event, panel, index) => {
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
	const selectImage = (panel, index) => { // changes the selected attribute in the image array
		generatedPaths = generatedPaths.map((image) =>
			image.index === index ? { ...image, selected: !image.selected } : image
		);
		selectedImages = [...getSelectedIndexes(generatedPaths)]
	};
	const getSelectedIndexes = (images) => {
    	return images.filter((image) => image.selected).map((image) => image.index);
  	};
	const toggleSideMenu = () => {
		showSideMenu = !showSideMenu;
	};
	const sortImages = (panel, order = null) => {
		if (panel === 'real') {
			if (order) {
				realPaths = realPaths.sort((a, b) => order.indexOf(a.index) - order.indexOf(b.index));
			} else {
				realPaths = realPaths.sort(() => Math.random() - 0.5);
			}
			} 
		else if (panel === 'generated') {
			if (order) {
				generatedPaths = generatedPaths.sort((a, b) => order.indexOf(a.index) - order.indexOf(b.index));
			} else {
				generatedPaths = generatedPaths.sort(() => Math.random() - 0.5);
			}
		}
		else { console.log('error: Wrong panel name in sortImages');}
  	};
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
	const handleDragStart = (event, index, tag) => {
		// event.preventDefault();
		dragStartIndex = index;
		console.log("dragStart")
		dragStartTag = tag;
		dragImages.push(index);
	};
	const handleDragEnter = (event, index) => {
		event.preventDefault();
		console.log("dragEnter")
		if (dragStartIndex !== null) {
		const startIndex = Math.min(dragStartIndex, index);
		const endIndex = Math.max(dragStartIndex, index);

		// for (let i = startIndex; i <= endIndex; i++) {
		// const im = generatedPaths[i];
		// updateTag('generated', im.index, dragStartTag);
		// dragImages.push(im.index);
		// console.log(dragImages)
	// }
			dragImages.push(index);
			updateTag('generated', index, dragStartTag);
			// console.log(dragImages)
		}
	};
	const handleDrop = (event) => {
		event.preventDefault();
		dragStartIndex = null;
		dragStartTag = '';
		dragImages = [];
	};
	onMount(async () => {
		window.addEventListener('click', handleClickOutside);		
		await Promise.all([loadRealImages(), loadGeneratedImages()]);
		// Clean up the event listener on component unmount
		return () => {
		  window.removeEventListener('click', handleClickOutside);
		};
	});

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

</script>
    
<div class="App">

	{#if !showSideMenu}
	<div class="menu-container">
		<div class="menu">
			<button on:click={toggleSideMenu}>Menu</button>
		</div>
	</div>
	{:else}
		<div class="side-menu">
			<button on:click={toggleSideMenu}>Back</button><br/>
			<button>Regenerate</button><br/>
			{#each tags as tag}
				<button>{tag}</button><br/>
			{/each}
		</div>
	{/if}

	<div class="panel">
		<h2>Real Images</h2>
		<div class="image-grid">
			{#each realPaths as { path, index, selected } (path)}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="grid-item" on:contextmenu={(e) => showContextMenu(e, 'real', index)}>
				
				<img src={path} alt={path}  class="panel-image" />
				{#if showMenuReal && selectedIndex === index}
					<div class="context-menu">
						<button on:click={() => sortImages('real', null)}>Sort Real</button>
						<button on:click={() => sortImages('generated', null)}>Sort Fake</button>
						<button>Tag</button>
					</div>
				{/if}
			</div>
			{/each}
		</div>
	</div>
	
	<div class="panel">
		<h2>Generated Images</h2>
		<div class="image-grid">
			{#each generatedPaths as { path, index, tag } (path)}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<button class="grid-item" 
					on:contextmenu={(e) => showContextMenu(e, 'generated', index) }
					on:click={(e) => showTagMenu(e, "generated", index)}
					draggable="true"
					on:dragstart={(e) => handleDragStart(e, index, tag)}
					on:dragenter={(e) => handleDragEnter(e, index)}
					on:dragend={handleDrop}>

				<button class="circle-button" on:click={(e) => handleCircleButtonClick(e, 'generated', index)}></button>
				<div class="tag-text">{tag}</div>

				<img src={path} alt={path}  class="panel-image" />
				{#if showMenuGen && selectedIndex === index}
					<div class="context-menu" >
						<button on:click={() => sortImages('real', null)}>Sort Real</button>
						<button on:click={() => sortImages('generated', null)}>Sort Fake</button>
					</div>
				{/if}

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
						<!-- 					
					<div class="decision-tree">
						<div class="decision-tree-level">
							<div class="decision-tree-level-label">Is the image good?</div>
							<button class="decision-tree-button" on:click={() => handleFirstLevelChoice(true)}>Yes</button>
							<button class="decision-tree-button" on:click={() => handleFirstLevelChoice(false)}>No</button>
						</div>
						{#if decisionTree.isGood !== null}
							<div class="decision-tree-level">
								<div class="decision-tree-level-label">Category:</div>
								<input type="checkbox" class="decision-tree-button" on:click={() => handleSecondLevelChoice('1')}/>Shape<br/>
								<input type="checkbox" class="decision-tree-button" on:click={() => handleSecondLevelChoice('2')}>Color<br/>
								<input type="checkbox" class="decision-tree-button" on:click={() => handleSecondLevelChoice('3')}>Texture<br/>
							</div>
						{/if}
					</div> -->
				{/if}
					

			</button>
			{/each}
		</div>
	</div>
</div>
  

<style>
.App {
	text-align: center;
	display: flex;
  }
.panel {
	flex: 1;
	padding: 20px;
	overflow-y: scroll;
	height: 100vh;
	border:1px solid black;
}

.image-grid {
	flex: 1;
	padding: 5px;
	display: grid;
	/* grid-template-columns: repeat(3, 1fr); Adjust the number of columns as needed */
	grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
	grid-gap: 5px;
}
.grid-item{
	position: relative;
    display: inline-block;
    margin: 5px;
}

.context-menu {
	position: absolute;
	background-color: white;
	padding: 10px;
	border: 1px solid black;
	z-index: 1000;
}

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
.panel-image {
	width : 100px;
	height : 100px;
}

.menu-container {
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1000;
  }
  .menu {
    background-color: #eee;
    padding: 10px;
    border-radius: 5px;
  }
  .side-menu {
    background-color: #eee;
    padding: 10px;
    border-radius: 5px;
  }

  .circle-button {
    position: absolute;
    top: 0px;
    right: 0px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #AAA;
    border: none;
    cursor: pointer;
    opacity: 0; /* Set initial opacity to 0 */
    transition: opacity 0.1s ease-in-out; /* Add transition effect for smooth appearance */
  }
   .grid-item:hover .circle-button {
    opacity: 1; /* Set opacity to 1 when hovering over the image container */
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

</style>