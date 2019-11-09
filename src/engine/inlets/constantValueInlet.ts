import DataflowModule from "../dataflowModule"
import Inlet from "./inlet"
import Variable from "../variable"
import {FlowVariableType} from "../types"

export default class ConstantValueInlet extends Inlet {
	hasNewValue: boolean = false;

	constructor(name: string, value: FlowVariableType) {
		super(name)
		console.log(`new constant value node with value ${value}`)
		if(value !== null) {
			this.hasNewValue = true
		}
		this.value = value
	}

	//Return true if there are any updates
	pollForUpdates(): boolean {
		return this.hasNewValue
	}

	evaluate(variables: {[index: string]: Variable}): boolean {
		return this.pollForUpdates()
	}

	setValue(value: FlowVariableType) {
		this.value = value
		this.hasNewValue = true //Tell myself that i have a new value
		if(this.connectedModule === undefined) {
			throw "Not hooked to an engine"
		}
		this.connectedModule.markDirty(this.name) //Tell the system i have a new value
	}
}