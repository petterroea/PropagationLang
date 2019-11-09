import Variable from "../variable"
import AtomicEvaluator from "./atomicEvaluator"
import Log from "../../log"

import {ImportTable} from "../../parser/parser"

export class PassthroughEvaluator extends AtomicEvaluator{
	getTargetCount() {
		return -1
	}

	evaluate(dependencies: string[], variables: {[index: string]: Variable}): any {
		return variables[dependencies[0]].value
	}
}

ImportTable["Utils"] = {
	"Passthrough": new PassthroughEvaluator()
}