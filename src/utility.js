let Utility = {};

Utility.generateId = () => {
	let id = '';
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for(let i = 0; i < 8; ++ i) {
		id += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return id;
};

Utility.frameToString = (frame) => {
	let str = '';

	for(let i in frame) {
		str += `${i}:${frame[i]};`;
	}

	return str;
};

Utility.convertTimeToMs = (time) => {
	if(!time) {
		return 0;
	}

	if(typeof time === 'number') {
		return time;
	}

	let ret = parseFloat(time);

	if(time.indexOf('ms') != -1) {
		return ret;
	}

	return ret * 1000;
};

Utility.prefixes = ['', '-webkit-', '-moz-', '-o-'];

export default Utility;