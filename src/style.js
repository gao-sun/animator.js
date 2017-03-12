let Style = {};

Style.convertToObject = (style) => {
	let str = style.substring(style.indexOf('{') + 1).trim().slice(0, -1);
	let obj = {};

	str.split(';').map((value) => {
		value = value.trim();

		if(!value) {
			return;
		}

		let tmp = value.split(':');

		obj[tmp[0].trim()] = tmp[1].trim();
	});

	return obj;
};

Style.getFromSheets = (selector) => {
	let sheets = document.styleSheets;

	for(let i in sheets) {
		let classes = null;

		try {
			classes = sheets[i].rules || sheets[i].cssRules;
		}
		catch (e) {}

		if(!classes) {
			continue;
		}

		for (let x in classes) {
			if (classes[x].selectorText && classes[x].selectorText.split(',').indexOf(selector) != -1) {
				if(classes[x].cssText) {
					return Style.convertToObject(classes[x].cssText);
				} else { 
					return Style.convertToObject(classes[x].style.cssText);
				}
			}
		}
	}
	
	return {};
};

Style.getPropertyDefault = (name) => {
	if(name == 'timing-function') {
		return 'ease';
	}

	if(name == 'iteration-count') {
		return 1;
	}

	if(name == 'direction') {
		return 'normal';
	}

	if(name == 'fill-mode') {
		return 'none';
	}

	return null;
};

export default Style;