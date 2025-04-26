const readSpeed = 180; // words per minute
const minimumTime = 3; // seconds

const hideButtonsDelay = 3; // seconds

const particles_enable = true;
const particles_baseSpeed = 0.1;
const particles_baseSize = 1;


const BPM_min = 15; // BPM
const BPM_max = 120; // BPM
const BPM_beatDuration = 400; // ms
const BPM_particleSpeed = 3; // Particles js
const BPM_particlesSize = 3;

const climbMax_duration = 5000; // ms
const climbMax_particleSpeed = 15; // Particles js
const climbMax_particlesSize = 4;
const climbMax_smoothSteps = 10;

// Manage file loading:
// Manual selection
const fileInput =  document.querySelector('#FileInput');
fileInput.addEventListener("change", (evt) => {
	// Executed when a file is selected from the file input
	if (fileInput.files.length == 1) {
		var fileReader = new FileReader();
		fileReader.readAsText(fileInput.files[0], "UTF-8");
		fileReader.onload = function (evt) {
			const rows = evt.target.result.split('\n');
			rows.forEach(row => {
				row = row.replaceAll('\r','');
				reader.addRow(row);			
			});
			reader.fileLoaded();
		}
	}
});

class Reader{
	// Store every UI functions
	constructor(){
		this.rowList = [];
		this.BPM_keyframes = [];
		this.index = 0;
		this.playStatus = false;
		this.playTimeout = null;

		this.buttonsShowed = true;
		this.hideButtonsTimeout = null;

		this.currentBPM = BPM_min;
		this.climbMaxStatus = 0;

		this.rowP = document.querySelector('#CurrentRow');
		this.navText = document.querySelector('#NavText');
		this.progressBar = document.querySelector('#ProgressBar');
		this.progressBar.style.width = '0vw';

		this.BPMHeart = document.querySelector('#BPMIndicatorHeart');
		this.BPMHeart.style.transition='width '+BPM_beatDuration/2+'ms, height '+BPM_beatDuration/2+'ms';
		this.BPMRing = document.querySelector('#BPMIndicatorRing');
	}
	addRow(rowText){
		// Add a row to the list from raw text
		var newRow = {};

		// Default time:
		var newTime = rowText.split(' ').length/readSpeed*60;
		if (newTime < minimumTime){
			newTime = minimumTime
		}
		newRow['time'] = newTime;
		
		// Custom time:
		if (rowText.includes('{time')){
			newRow['time'] = parseInt(rowText.split('=')[1].split('}')[0]);
			rowText = rowText.replaceAll('{time='+newRow['time']+'}','');
		}

		// Custom BPM:
		if (rowText.includes('{bpm')){
			const newBPM = rowText.split('=')[1].split('}')[0];
			reader.BPM_keyframes.push([
				reader.rowList.length-1,
				parseInt(newBPM)
			]);
			rowText = rowText.replaceAll('{bpm='+newBPM+'}','');
		}

		// Climbmax:
		newRow['climbmax'] = false;
		if (rowText.includes('{climbmax}')){
			newRow['climbmax'] = true;
			rowText = rowText.replaceAll('{climbmax}','');
		}

		// Add text and create row:
		newRow['text'] = rowText;
		this.rowList.push(newRow);
	}
	generateBPMinterpolation(){
		// Generate BPM per row based on previously loaded {BPM=} values
		var interpolatedBPM = BPM_min;
		var nextKeyIndex=-1;
		var nextKeyPosition = -1;
		var nextKeyValue = 0;
		for (var i=0; i<reader.rowList.length;i++){
			while (nextKeyPosition<i){
				nextKeyIndex += 1;
				nextKeyPosition = reader.BPM_keyframes[nextKeyIndex][0]+2;
				nextKeyValue = reader.BPM_keyframes[nextKeyIndex][1];
			}
			if (interpolatedBPM != nextKeyValue){
				interpolatedBPM += (nextKeyValue - interpolatedBPM)/(nextKeyPosition-i)
			}
			
			reader.rowList[i]['BPM'] = interpolatedBPM;
		}
	}
	fileLoaded(){
		reader.generateBPMinterpolation();

		document.querySelector('#FileInput').remove();
		reader.pause();
		reader.setRowIndex(0);
		// Particles:
		if (particles_enable){
			window.particlesJS('particles-js', particles_params);
		}
		reader.runBPM();
		document.body.requestFullscreen();
	}
	play(){
		// Play the sequence of rows
		reader.playStatus = true;
		reader.setRowIndex(reader.index);

		// Update button:
		document.querySelector('#PlayPauseButton').querySelector('p').innerHTML = "⏸";
		reader.hideButtons();
	}
	pause(){
		// Interrupts rows display sequence
		reader.playStatus = false;
		// Reset previous timer:
		if (reader.playTimeout){
			clearTimeout(reader.playTimeout);
		}
		// Reset bar:
		reader.progressBar.style.transition = 'width 0.5s linear';
		reader.progressBar.style.width = '0vw';
		// Update button:
		document.querySelector('#PlayPauseButton').querySelector('p').innerHTML = "▶";
	}
	hideButtons(){
		// Hide bottom UI buttons
		reader.buttonsShowed = false;
		document.querySelector('#NavWindow').style.opacity = 0;
	}
	showButtons(){
		// Shows bottom UI buttons
		reader.buttonsShowed = true;
		document.querySelector('#NavWindow').style.opacity = 1;
	}
	resetButtonsHideDelay(){
		// Executed at each wake-up action. If not cancelled by the next call hides the buttons
		if (reader.hideButtonsTimeout){
			clearTimeout(reader.hideButtonsTimeout);
		}
		reader.hideButtonsTimeout = setTimeout(function(){
			if (reader.playStatus){
				if (reader.buttonsShowed){
					reader.hideButtons();
				}
			}
		}, hideButtonsDelay*1000);
		reader.showButtons();
	}

	setRowIndex(index){
		// Immediatly display the row from index
		// Update main row:
		reader.rowP.innerHTML = this.rowList[index]['text'];

		// Update BPM
		reader.currentBPM = this.rowList[index]['BPM'];

		// Update nav text
		reader.navText.innerHTML = (index+1)+"/"+this.rowList.length;

		// Reset climbmax if fired at previous step
		if (reader.climbMaxStatus == 2){
			reader.climbMaxStatus = 0;
		}
		// Trigger climbmax if required
		if (reader.rowList[index]['climbmax']){
			if (reader.rowList[index]['time']*1000 < climbMax_duration){
				reader.rowList[index]['time'] = (climbMax_duration/1000+BPM_beatDuration/1000)*1.5;
			}
			reader.climbMaxStatus = 1;
		}

		if (reader.playStatus){
			// Set timer for next one
			reader.playTimeout = setTimeout(reader.moveToNext,reader.rowList[index]['time']*1000);
			// Play status bar
			reader.progressBar.style.transition = 'width '+reader.rowList[index]['time']+'s linear';
			reader.progressBar.style.width = '100vw';
		}
		reader.index = index;
	}
	moveTo(index){
		// Transition to display the row from index
		reader.rowP.style.opacity = 0;

		setTimeout(function(){
			reader.progressBar.style.transition = 'width 0.5s linear';
			reader.progressBar.style.width = '0vw';
		},500)
	
		setTimeout(function(){
			reader.setRowIndex(index);
			reader.rowP.style.opacity = 1;
		},1000);
	}
	moveToNext(){
		// Transition to the next row
		if (reader.index+1 < reader.rowList.length){
			reader.moveTo(reader.index+1);
		}
	}

	runBPM(){
		if (reader.climbMaxStatus == 0){ // No climbmax in progress or scheduled
			if (reader.playStatus){
				if (reader.currentBPM > 0){
					// Particles
					if (particles_enable){
						// Force particles to show a beat
						pJSDom[0].pJS.particles.size.value = BPM_particlesSize*(reader.currentBPM-BPM_min)/(BPM_max-BPM_min);
						pJSDom[0].pJS.particles.move.speed = BPM_particleSpeed*(reader.currentBPM-BPM_min)/(BPM_max-BPM_min);

						setTimeout(function(){
							pJSDom[0].pJS.particles.size.value = particles_baseSize;
							pJSDom[0].pJS.particles.move.speed = particles_baseSpeed;
						},BPM_beatDuration);
					}

					// BPM indicator
					reader.BPMHeart.style.width = '10%';
					reader.BPMHeart.style.height = '10%';

					reader.BPMRing.style.width = '100%';
					reader.BPMRing.style.height = '100%';
					reader.BPMRing.style.opacity = '0.1';
					reader.BPMRing.style.transition='width '+BPM_beatDuration+'ms, height '+BPM_beatDuration+'ms, opacity '+BPM_beatDuration+'ms';


					setTimeout(function(){
						reader.BPMHeart.style.width = '20%';
						reader.BPMHeart.style.height = '20%';
					},BPM_beatDuration/2);

					setTimeout(function(){
						reader.BPMRing.style.transition='';
						reader.BPMRing.style.width = '15%';
						reader.BPMRing.style.height = '15%';
						reader.BPMRing.style.opacity = '1';
					},BPM_beatDuration);
				}
			}
			
		}
		if (reader.climbMaxStatus == 1){ // Climbmax was scheduled
			reader.runClimbMax();
		}
		if (reader.climbMaxStatus == 2){ // Climbmax is in progress
			null;
		}
		// Schedule next occurences
		if (reader.currentBPM > 0){
			setTimeout(reader.runBPM, 60/reader.currentBPM*1000);
		}
		else{
			setTimeout(reader.runBPM, 1000); // Wait for return of BPM
		}
	}
	runClimbMax(){
		// Similar to BPM, but intense and longer
		
		if (reader.playStatus){
			reader.climbMaxStatus = 2; // Defuse next iteration of runBPM to avoid multiple climbmaxs
			// Particles
			if (particles_enable){
				// Force particles to show a beat

				pJSDom[0].pJS.particles.size.value = climbMax_particlesSize;
				pJSDom[0].pJS.particles.move.speed = climbMax_particleSpeed;
				
				for (var i=0; i<climbMax_smoothSteps;i++){
					setTimeout(function(i){
						pJSDom[0].pJS.particles.size.value = climbMax_particlesSize - (climbMax_particlesSize-particles_baseSize)*(i/(climbMax_smoothSteps-1));
						pJSDom[0].pJS.particles.move.speed = climbMax_particleSpeed - (climbMax_particleSpeed-particles_baseSpeed*2)*Math.pow(i/(climbMax_smoothSteps-1),1/3);
					},climbMax_duration*i/(climbMax_smoothSteps-1),i);
				}
			}

			// BPM indicator
			reader.BPMRing.style.width = '200%';
			reader.BPMRing.style.height = '200%';
			reader.BPMRing.style.opacity = '0.1';
			reader.BPMRing.style.transition='width '+climbMax_duration+'ms, height '+climbMax_duration+'ms, opacity '+climbMax_duration+'ms';

			setTimeout(function(){
				reader.BPMRing.style.transition='';
				reader.BPMRing.style.width = '15%';
				reader.BPMRing.style.height = '15%';
				reader.BPMRing.style.opacity = '1';
			},climbMax_duration);
		}
	}
}


//  Add user interaction events on buttons:
document.querySelector('#PreviousButton').addEventListener('click',function(){
	if (reader.index-1 >= 0){
		reader.resetButtonsHideDelay();
		reader.pause();
		reader.setRowIndex(reader.index-1);
	}
});
document.querySelector('#PlayPauseButton').addEventListener('click',function(){
	reader.resetButtonsHideDelay();
	if (reader.playStatus){
		reader.pause()	
	}
	else{
		reader.play();
	}
});
document.querySelector('#NextButton').addEventListener('click',function(){
	if (reader.index+1 < reader.rowList.length){
		reader.resetButtonsHideDelay();
		reader.pause();
		reader.setRowIndex(reader.index+1);
	}
});

// User generic mouse and keyboard interactions:
document.body.addEventListener('keydown',function(ev){
	if (ev.key == "ArrowLeft"){
		document.querySelector('#PreviousButton').click();
	}
	if (ev.key == " "){
		document.querySelector('#PlayPauseButton').click();
	}
	if (ev.key == "ArrowRight"){
		document.querySelector('#NextButton').click();
	}
})

document.body.addEventListener('mousemove',function(ev){
	if (!reader.buttonsShowed){
		reader.resetButtonsHideDelay();
	}
})
document.body.addEventListener('click',function(ev){
	if (!reader.buttonsShowed){
		reader.resetButtonsHideDelay();
	}
},true);

// Debug
const reader = new Reader();


// Initialisation:
reader.resetButtonsHideDelay();