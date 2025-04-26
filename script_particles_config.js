particles_params = {
	"particles": {
	  "number": {
		"value": 100,
		"density": {
		  "enable": true,
		  "value_area": 500
		}
	  },
	  "color": {
		"value": "#ffffff"
	  },
	  "shape": {
		"type": "circle",
		"stroke": {
		  "width": 0,
		  "color": "#000000"
		},
		"polygon": {
		  "nb_sides": 5
		},
		"image": {
		  "src": "img/github.svg",
		  "width": 100,
		  "height": 100
		}
	  },
	  "opacity": {
		"value": 1,
		"random": false,
		"anim": {
		  "enable": true,
		  "speed": 0.5,
		  "opacity_min": 0.25,
		  "sync": false
		}
	  },
	  "size": {
		"value": 1,
		"random": true,
		"anim": {
		  "enable": true,
		  "speed": 5,
		  "size_min": 1,
		  "sync": false
		}
	  },
	  "line_linked": {
		"enable": false,
		"distance": 300,
		"color": "#ffffff",
		"opacity": 0.4,
		"width": 2
	  },
	  "move": {
		"enable": true,
		"speed": 0.1,
		"direction": "none",
		"random": true,
		"straight": false,
		"out_mode": "bounce",
		"bounce": false,
		"attract": {
		  "enable": false,
		  "rotateX": 600,
		  "rotateY": 1200
		}
	  }
	},
	"interactivity": {
	  "detect_on": "canvas",
	  "events": {
		"onhover": {
		  "enable": false,
		  "mode": "repulse"
		},
		"onclick": {
		  "enable": false,
		  "mode": "push"
		},
		"resize": true
	  },
	  "modes": {
		"grab": {
		  "distance": 800,
		  "line_linked": {
			"opacity": 1
		  }
		},
		"bubble": {
		  "distance": 800,
		  "size": 80,
		  "duration": 2,
		  "opacity": 0.8,
		  "speed": 3
		},
		"repulse": {
		  "distance": 400,
		  "duration": 0.4
		},
		"push": {
		  "particles_nb": 4
		},
		"remove": {
		  "particles_nb": 2
		}
	  }
	},
	"retina_detect": true
  }
