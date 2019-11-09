import Variable from "./variable"
import Log from "../log"
import Inlet from "./inlets/inlet"
import Outlet from "./outlets/outlet"

let RUN_INTERVAL = 200
let WAIT_TIME = 1000

export default class DataflowModule {
	public variables: {[index: string]: Variable} = {}

	public inlets: {[index: string]: Inlet} = {}
	public outlets: {[index: string]: Outlet} = {}

	public queue: string[] = []

	uniqueCounter: number = 0

	constructor(public name: string) {

	}

	getUniqueVariable() {
		return `V_${this.uniqueCounter++}`
	}

	addVariable(varToAdd: Variable) {
		Log.d(`Adding the variable ${varToAdd.name}`)

		if(typeof this.variables[varToAdd.name] !== "undefined") {
			throw "Failed to add variable as there already is a variable with that name"
		}

		for(let dependency of varToAdd.dependencies) {
			if(typeof this.variables[dependency] === "undefined") {
				throw `Tried to add variable with undefined dependency: ${dependency}`
			}
		}
		this.variables[varToAdd.name] = varToAdd
		Log.d(`It has the following dependencies: ${varToAdd.dependencies}`)

		for(let dependency of varToAdd.dependencies) {
			Log.d(`Registering dependency in ${dependency}`)

			this.variables[dependency].dependents.push(varToAdd.name)
			Log.d(`Its dependents now looks like this: ${this.variables[dependency].dependents}`)
		}
	}

	addInlet(inlet: Inlet) {
		this.addVariable(inlet)
		inlet.hook(this)
		this.inlets[inlet.name] = inlet
	}

	addOutlet(outlet: Outlet) {
		this.addVariable(outlet)
		outlet.hook(this)
		this.outlets[outlet.name] = outlet
	}

	run() {
		let startTime = new Date().getTime()
		let iterations = 0;

		//First, poll inlets for new values
		Log.d(`Inlets: ${Object.keys(this.inlets)}`)
		for(let inletName in this.inlets) {
			Log.d(`Checking inlet ${inletName}`)
			if(this.inlets[inletName].pollForUpdates()) {
				Log.d(`Inlet ${inletName} has a new value`)
				this.markDirty(inletName)
			}
		}

		while(this.queue.length > 0 && new Date().getTime() - startTime < RUN_INTERVAL) {
			iterations++
			let variableName = this.queue.shift()
			if(variableName === undefined) {
				break;
			}
			Log.d(`=======================================`)
			Log.d(`New iteration: ${variableName}`)

			let variable = this.variables[variableName]

			variable.dirty = false
			if(variable.evaluate(this.variables)) {
				for(let dependency of variable.dependents) {
					this.markDirty(dependency)
					Log.d(`Marked ${dependency} dirty`)
				}
			}
		}
		Log.i(`Did ${iterations} iterations in ${new Date().getTime() - startTime} ms`)
		//Schedule a new time to run some things from the queue
		if(this.queue.length != 0) {
			setTimeout(this.run.bind(this), WAIT_TIME);
		}
	}

	markDirty(variableName: string) {
		if(this.variables[variableName].dirty) {
			return
		}
		this.queue.push(variableName)
	}
}