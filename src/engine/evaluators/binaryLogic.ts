import Variable from "../variable"
import AtomicEvaluator from "./atomicEvaluator"
import Log from "../../log"

import {ImportTable} from "../../parser/parser"

export class BinaryAndEvaluator extends AtomicEvaluator{
	getTargetCount() {
		return -1
	}

	evaluate(dependencies: string[], variables: {[index: string]: Variable}): any {
		let current = true
		Log.d(`AND`)
		for(let dependent of dependencies) {
			Log.d(`${dependent} is ${!!variables[dependent].value}`)
			current = current && !!variables[dependent].value
		}
		return current
	}
}

export class BinaryNorEvaluator extends AtomicEvaluator{
	getTargetCount() {
		return -1
	}

	evaluate(dependencies: string[], variables: {[index: string]: Variable}): any {
		let current = false
		for(let dependent of dependencies) {
			current = current || !variables[dependent].value
		}
		return current
	}
}

export class BinaryOrEvaluator extends AtomicEvaluator{
	getTargetCount() {
		return -1
	}

	evaluate(dependencies: string[], variables: {[index: string]: Variable}): any {
		let current = false
		for(let dependent of dependencies) {
			current = current || !!variables[dependent].value
		}
		return current
	}
}

export class BinaryXorEvaluator extends AtomicEvaluator{
	getTargetCount() {
		return -1
	}



	evaluate(dependencies: string[], variables: {[index: string]: Variable}): any {
		let current = !!variables[dependencies[0]].value
		for(let i = 1; i < dependencies.length; i++) {
			let b = !!variables[dependencies[i]].value
			current = (current && !b) || (!current && b)
		}
		return current
	}
}

Log.d("Setting up binary import table")

ImportTable["Binary"] = {
	"And": new BinaryAndEvaluator(),
	"Nor": new BinaryNorEvaluator(),
	"Or": new BinaryOrEvaluator(),
	"Xor": new BinaryXorEvaluator()
}