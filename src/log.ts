let log = {
	e: (...message: string[]) => {
		console.log("ERROR: ", ...message);
	},
	w: (...message: string[]) => {
		console.log("WARN: ", ...message);
	},
	i: (...message: string[]) => {
		console.log("INFO: ", ...message);
	},
	v: (...message: string[]) => {
		console.log("VERBOSE: ", ...message);
	},
	d: (...message: string[]) => {
		console.log("DEBUG: ", ...message);
	},
};

export default log;