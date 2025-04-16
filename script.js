readSpeed = 180; // words per minute
minimumTime = 3; // seconds

hideButtonsDelay = 3; // seconds

particles_enable = true;
particlesBPM_min = 15; // BPM
particlesBPM_max = 120; // BPM
particlesBPM_beatDuration = 400; // ms
particlesBPM_speed = 5; // Particles js

fileInput =  document.querySelector('#FileInput');

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
		this.index = 0;
		this.playStatus = false;
		this.playTimeout = null;

		this.buttonsShowed = true;
		this.hideButtonsTimeout = null;

		this.currentBPM = particlesBPM_min;

		this.rowP = document.querySelector('#CurrentRow');
		this.navText = document.querySelector('#NavText');
		this.progressBar = document.querySelector('#ProgressBar');
		this.progressBar.style.width = '0vw';

		this.BPMHeart = document.querySelector('#BPMIndicatorHeart');
		this.BPMHeart.style.transition='width '+particlesBPM_beatDuration/2+'ms, height '+particlesBPM_beatDuration/2+'ms';
		this.BPMRing = document.querySelector('#BPMIndicatorRing');
	}
	addRow(rowText){
		// Add a row to the list from raw text
		var newRow = {};
		
		newRow['text'] = rowText;
		if (!rowText.includes('{time')){
			var newTime = rowText.split(' ').length/readSpeed*60;
			if (newTime < minimumTime){
				newTime = minimumTime
			}
			newRow['time'] = newTime;
		}
		else{
			newRow['time'] = parseInt(rowText.split('=')[1].split('}')[0]);
			
			newRow['text'] = rowText.split('}')[1];
		}

		this.rowList.push(newRow);
	}
	fileLoaded(){
		document.querySelector('#FileInput').remove();
		reader.pause();
		reader.setRowIndex(0);
		// Particles:
		if (particles_enable){
			particlesJS.load('particles-js', 'particles.json', function() {
				console.log('Particles.js config loaded');
			});
		}
		reader.runBPM();
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

		// Update nav text
		reader.navText.innerHTML = (index+1)+"/"+this.rowList.length;

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
		if (reader.playStatus){
			// Particles
			if (particles_enable){
				// Force particles to show a beat
				pJSDom[0].pJS.particles.size.value = 3*(reader.currentBPM-particlesBPM_min)/(particlesBPM_max-particlesBPM_min);
				pJSDom[0].pJS.particles.size.anim.size_min = 1;
				pJSDom[0].pJS.particles.move.speed = 0.5;
				// setTimeout(function(ratio){
				// 	pJSDom[0].pJS.particles.move.speed = -particlesBPM_speed;
				// },particlesBPM_beatDuration/2);
				setTimeout(function(ratio){
					pJSDom[0].pJS.particles.size.value = 1;
					pJSDom[0].pJS.particles.size.anim.size_min = 1;
					pJSDom[0].pJS.particles.move.speed = 0.1;
				},particlesBPM_beatDuration);
			}

			// BPM indicator
			reader.BPMHeart.style.width = '10%';
			reader.BPMHeart.style.height = '10%';

			reader.BPMRing.style.width = '100%';
			reader.BPMRing.style.height = '100%';
			reader.BPMRing.style.opacity = '0.1';
			reader.BPMRing.style.transition='width '+particlesBPM_beatDuration+'ms, height '+particlesBPM_beatDuration+'ms, opacity '+particlesBPM_beatDuration+'ms';


			setTimeout(function(){
				reader.BPMHeart.style.width = '20%';
				reader.BPMHeart.style.height = '20%';
			},particlesBPM_beatDuration/2);

			setTimeout(function(){
				reader.BPMRing.style.transition='';
				reader.BPMRing.style.width = '15%';
				reader.BPMRing.style.height = '15%';
				reader.BPMRing.style.opacity = '1';
			},particlesBPM_beatDuration);
		}
		// Schedule next occurences
		setTimeout(reader.runBPM, 60/reader.currentBPM*1000)
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
// reader.addRow("Exemple 1")
// reader.addRow("Exemple 2 vraiment vraiment vraiment très long, et à rallonge, et rallongé jusqu'à l'infini de l'inifini")
// reader.addRow("{time=30}3Très court mais très long")
// reader.addRow("Ok")
// reader.addRow("Un autre essai")
// reader.addRow("Une autre")
// reader.addRow("{time=10}Seulement 10s")
// reader.addRow("On approche de la fin")
// reader.addRow("Très proche")
// reader.addRow("C'est la dernière")


// Initialisation:
reader.resetButtonsHideDelay();