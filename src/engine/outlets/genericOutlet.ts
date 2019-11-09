import DataflowModule from "../dataflowModule"
import Variable from "../variable"
import Outlet from "./outlet"

import AtomicEvalutator from "../evaluators/atomicEvaluator"

import Log from "../../log"

export default class GenericOutlet extends Outlet{

	eventHandlers: Array<(data: any) => void> = [] 

	constructor(name: string, public dependencies: string[], evaluator: AtomicEvalutator) {
		super(name, dependencies, evaluator)
	}

	evaluate(variables: {[index: string]: Variable}): boolean {
		if(this.evaluator === undefined) {
			throw "Outlets must be connected to something"
		}
		let newValue = this.evaluator.evaluate(this.dependencies, variables)
		let oldValue = this.value

		this.value = newValue

		if(newValue != oldValue) {
			for(let handler of this.eventHandlers) {
				handler(newValue)
			}
			return true
		}
		return false
	}

	registerEventHandler(handler: (data: any) => void) {
		this.eventHandlers.push(handler)
	}
}