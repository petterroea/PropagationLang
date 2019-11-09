import AtomicEvalutator from "./evaluators/atomicEvaluator"
import Log from "../log"

import {FlowVariableType} from "./types"

export default class Variable {
	dependents: string[]
	dirty: boolean = false

	constructor(public name: string, public value: FlowVariableType, public dependencies: string[], public evaluator?: AtomicEvalutator) {
		this.dependents = []
	}

	//Returns true if dirty
	evaluate(variables: {[index: string]: Variable}): boolean {
		if(this.evaluator === undefined) {
			Log.d(`Skipped evaluating ${this.name} as it is static`)
			return false
		}

		let newValue = this.evaluator.evaluate(this.dependencies, variables)
		let oldValue = this.value

		Log.d(`Evaluating ${this.name}, ${oldValue} -> ${newValue}`)

		this.value = newValue
		if(newValue != oldValue) {
			return true
		}
		return false
	}
}