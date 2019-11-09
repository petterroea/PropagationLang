import DataflowModule from "../dataflowModule"
import Variable from "../variable"


import AtomicEvalutator from "../evaluators/atomicEvaluator"

/*
 * An outlet is a variable that exports values to the outside world
 * Note that it can still be used as a variable
*/
export default class Outlet extends Variable{
	connectedModule?: DataflowModule

	constructor(name: string, public dependencies: string[], evaluator: AtomicEvalutator) {
		super(name, null, dependencies, evaluator)
	}

	evaluate(variables: {[index: string]: Variable}): boolean {
		if(this.evaluator === undefined) {
			throw "Outlets must be connected to something"
		}
		let newValue = this.evaluator.evaluate(this.dependencies, variables)
		let oldValue = this.value
		this.value = newValue
		if(newValue != oldValue) {
			return true
		}
		return false
	}

	hook(engine: DataflowModule) {
		this.connectedModule = engine
	}
}