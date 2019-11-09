import DataflowModule from "../dataflowModule"
import Variable from "../variable"

/*
 * An inlet is a variable that is used to import data from the outside environment
 *
 * Note that it can't get values
 */
export default class Inlet extends Variable {
	connectedModule?: DataflowModule

	constructor(public name: string) {
		super(name, null, [])
	}

	//Return true if there are any updates
	pollForUpdates(): boolean {
		return false
	}

	evaluate(variables: {[index: string]: Variable}): boolean {
		return this.pollForUpdates()
	}

	hook(engine: DataflowModule) {
		this.connectedModule = engine
	}
}