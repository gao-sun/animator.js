import Utility from './utility';

let Animation = {};

Animation.make = (frames, prefixes) => {
	let names = [];
	let html = '';
	let namePrefix = 'atr-' + Utility.generateId();
	let style = document.createElement('style');

	for(let i = 0; i < frames.length - 1; ++ i) {
		names.push(namePrefix + '-' + (i + 1));
		html += Animation.makeFromTwoFrames(frames[i], frames[i + 1], names[i], prefixes);
	}

	style.innerHTML = html;
	style.class="foo";
	document.getElementsByTagName('head')[0].appendChild(style);

	return { names: names, styleDom: style };
};

Animation.makeFromTwoFrames = (f1, f2, name, prefixes) => {
	let keyFrames = '';
	
	for(let i in prefixes) {
		keyFrames += '@' + prefixes[i] + 'keyframes ' + name + ' {';
		keyFrames += '0%';
		keyFrames += '{' + Utility.frameToString(f1) + '}';
		keyFrames += '100%';
		keyFrames += '{' + Utility.frameToString(f2) + '}';
		keyFrames += '}';
	}

	return keyFrames;
};

export default Animation;