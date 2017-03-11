import Style from './style';

class Frame {
	constructor(styles, options) {
		if(typeof styles === 'string') {
			this.styles = Style.getFromSheets(styles);
		} else {
			this.styles = styles;	
		}
		
		if(typeof options === 'string') {
			let tmp = Style.getFromSheets(options);
			this.options = {};
			
			for(let i in tmp) {
				this.options[i.replace('animation-', '')] = tmp[i];
			}
		} else if(typeof options === 'number') {
			this.options = { duration: options };
		} else {
			this.options = options;
		}
	}
}

export default Frame;