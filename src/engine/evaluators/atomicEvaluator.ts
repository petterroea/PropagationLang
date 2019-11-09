import Variable from "../variable"


export default class AtomicEvaluator {
	constructor() {

	}

	getTargetCount() {
		return 1
	}

	getMinTargetCount() {
		return 1
	}

	evaluate(dependencies: string[], variables: {[index: string]: Variable}): any {
		throw "It is illegal to use the default evaluator"
	}
}