import Animation from './animation';
import Utility from './utility';
import Style from './style';

class Queue {
	constructor(doms, frames, options, extra) {
		if(doms.constructor === Array) {
			this.doms = doms;
		} else {
			this.doms = [doms];
		}
		
		if(frames.constructor === Array) {
			this.frames = frames;
		} else {
			this.frames = [frames];
		}

		this.options = {
			startFrom: 0,
			pauseAt: [],
			prefix: false,
			count: 1,
			clear: true,
			applyOnEnd: false,
			instant: false 
		};

		if(options != null && options != undefined) {
			if(typeof options === 'boolean') {
				this.options['instant'] = options;
			} else if(typeof options === 'number') {
				this.options['count'] = options;

				if(typeof extra === 'boolean') {
					this.options['instant'] = extra;
				}
			} else {
				for(let i in options) {
					if(i == 'pauseAt' && !(options.pauseAt.constructor === Array)) {
						this.options[i] = [options[i]];
					} else {
						this.options[i] = options[i];
					}
				}
			}
		}

		// Init
		this.promiseSupported = (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1);
		this.countRemainder = [];
		this.animations = [];
		this.styleDoms = [];
		this.superSets = [];
		this.eventHandler = [];

		if(this.options.prefix) {
			this.prefixes = Utility.prefixes;
		} else {
			this.prefixes = [''];
		}

		for(let i in doms) {
			this.countRemainder[i] = this.options.count - 1;
		}

		if(this.options.instant) {
			this.play();
		}
	}

	// Controllers
	play() {
		this.clear();

		if(this.promiseSupported) {
			this.promise = new Promise((resolve) => {
				this.promiseResolve = resolve;
			});
		}

		for(let i in this.doms) {
			let animation = this.makeAnimation(this.doms[i]);

			this.animations[i] = animation.names;
			this.styleDoms[i] = animation.styleDom;
			this.superSets[i] = this.makeSuperSet(this.doms[i], this.animations[i]);
			this.playAnimation(this.doms[i], this.superSets[i]);
		
			this.eventHandler[i] = this.handleAnimationEnd.bind(this, i);
			this.doms[i].addEventListener('animationend', this.eventHandler[i]);
		}

		if(this.promiseSupported) {
			return this.promise;
		}
	}

	clear(i) {
		if(!i) {
			for(let i in this.doms) {
				this.clear(i);
			}

			this.animationEnded = 0;
			this.promise = undefined;
			this.promiseResolve = undefined;

			return;
		}

		let dom = this.styleDoms[i];

		if(dom && dom.parentNode) {
			dom.parentNode.removeChild(dom);
		}

		for(let j in this.superSets[i]) {
			for(let k in this.prefixes) {
				this.doms[i].style[this.prefixes[k] + 'animation-' + j] = null;
			}
		}

		for(let k in this.prefixes) {
			this.doms[i].style[this.prefixes[k] + 'animation-play-state'] = null;
		}

		this.doms[i].removeEventListener('animationend', this.eventHandler[i]);
		this.countRemainder[i] = this.options.count - 1;
	}

	replay(index) {
		let dom = this.doms[index];
		let newDom = dom.cloneNode(true);

		dom.parentNode.replaceChild(newDom, dom);
		this.doms[index].removeEventListener('animationend', this.eventHandler[index]);
		this.doms[index] = newDom;
		this.doms[index].addEventListener('animationend', this.eventHandler[index]);
	}

	pause() {
		for(let i in this.doms) {
			this.pauseDom(this.doms[i]);
		}
	}

	resume() {
		for(let i in this.doms) {
			this.resumeDom(this.doms[i]);
		}
	}

	getPromise() {
		return this.promise;
	}

	// Assistants
	handleAnimationEnd(domIndex, event) {
		let name = event.animationName;
		let index = name.substring(name.lastIndexOf('-') + 1);

		if(this.options.pauseAt.includes(parseInt(index))) {
			this.pauseDom(this.doms[domIndex]);
		}

		if(index == this.frames.length) {
			if(this.countRemainder[domIndex] == -1) {
				this.replay(domIndex);
			} else if(this.countRemainder[domIndex] > 0) {
				this.countRemainder[domIndex] --;
				this.replay(domIndex);
			} else {
				if(this.options.applyOnEnd) {
					this.applyOnEnd(domIndex);
				}

				this.animationEnded ++;

				if(this.animationEnded == this.doms.length) {
					if(this.promiseSupported) {
						this.promiseResolve();
					}

					if(this.options.clear) {
						this.clear();
					}
				}
			}
		}
	}

	pauseDom(dom) {
		for(let i in this.prefixes) {
			dom.style[this.prefixes[i] + 'animation-play-state'] = 'paused';
		}
	}

	resumeDom(dom) {
		for(let i in this.prefixes) {
			dom.style[this.prefixes[i] + 'animation-play-state'] = 'running';
		}
	}

	applyOnEnd(index) {
		let lastFrame = this.newFrames[this.frames.length];

		for(let i in lastFrame) {
			this.doms[index].style[i] = lastFrame[i];
		}
	}

	makeAnimation(dom) {
		let initial = {};
		let frames = [];
		let superSet = {};

		for(let i in this.frames) {
			frames.push(this.frames[i].styles);

			for(let j in frames[i]) {
				superSet[j] = true;
			}
		}

		// Make initial frame
		let originalStyle = window.getComputedStyle(dom);
		for(let i in superSet) {
			initial[i] = originalStyle[i];
		}

		frames.unshift(initial);

		let newFrames = [frames[0]];

		// Make new frames
		for(let i = 1; i < frames.length; ++ i) {
			let newFrame = JSON.parse(JSON.stringify(frames[i - 1]));

			for(let j in frames[i]) {
				newFrame[j] = frames[i][j];
			}

			newFrames.push(newFrame);
		}

		this.newFrames = newFrames;

		return Animation.make(newFrames, this.prefixes);
	}

	makeSuperSet(dom, animations) {
		let currentDelay = 0;

		// Init Superset
		let superSet = {};

		for(let i in this.frames) {
			for(let j in this.frames[i].options) {
				superSet[j] = '';
			}
		}

		superSet['name'] = '';
		superSet['duration'] = '';
		superSet['delay'] = '';

		// Start Generation
		for(let i = 0; i < this.frames.length; ++ i) {
			if(i) {
				for(let j in superSet) {
					superSet[j] += ',';
				}
			}

			let time = Utility.convertTimeToMs(this.frames[i].options.duration);
			let delay = Utility.convertTimeToMs(this.frames[i].options.delay);

			if(i < this.options.startFrom) {
				time = 0;
				delay = 0;
			}

			superSet['name'] += animations[i];
			superSet['duration'] += time + 'ms';
			superSet['delay'] += (currentDelay + delay) + 'ms';

			for(let j in superSet) {
				if(j != 'name' && j != 'duration' && j != 'delay') {
					superSet[j] += this.frames[i].options[j] ? this.frames[i].options[j] : Style.getPropertyDefault(j);
				}
			}

			let count = this.frames[i].options['iteration-count'];

			currentDelay += time * parseInt(count ? count : 1) + delay;
		}

		return superSet;
	}

	playAnimation(dom, superSet) {
		for(let i in superSet) {
			for(let j in this.prefixes) {
				dom.style[this.prefixes[j] + 'animation-' + i] = superSet[i];
			}
		}

		if(this.options.pauseAt.includes(0)) {
			this.pauseDom(dom);
		}
	}
}

export default Queue;