import fs from "fs";

import Log from "../log"

import DataflowModule from "../engine/dataflowModule"
import AtomicEvaluator from "../engine/evaluators/atomicEvaluator"

import Variable from "../engine/variable"

import Inlet from "../engine/inlets/inlet"
import ConstantValueInlet from "../engine/inlets/constantValueInlet"

import Outlet from "../engine/outlets/outlet"
import GenericOutlet from "../engine/outlets/genericOutlet"

import Lexemize from "./lexemize"
import Tokenize, {Token, TokenType} from "./tokenize"

export const ImportTable: {[index: string]: {[index: string]: AtomicEvaluator}} = {}

import {PassthroughEvaluator} from "../engine/evaluators/utils"

//Make sure imports are registered
require("../engine/evaluators/binaryLogic")

//Turns tokens into modules
function InterpretTokens(tokens: Token[]): {[index: string]: DataflowModule} {
	let modules: {[index: string]: DataflowModule} = {}
	let currentImports: {[index: string]: {[index: string]: AtomicEvaluator}} = {}

	let currentModule:null|DataflowModule = null

	Log.d(`Importable modules: ${Object.keys(ImportTable)}`)

	while(tokens.length > 0) {
		let token = tokens.shift()

		if(typeof token === "undefined") {
			throw "This shouldn't happen"
		}

		Log.d(`Iteration: ${TokenType[token.type]}(${token.value})`)

		if(token.type === TokenType.KEYWORD) {
			switch(token.value) {
				case "import":
					let toImport = tokens.shift()
					if(typeof toImport === "undefined") {
						throw "This shouldn't happen"
					}
					if(typeof ImportTable[toImport.value] === "undefined") {
						throw `Failed to import ${toImport.value} at line ${token.lineNumber}`
					}
					if(typeof currentImports[toImport.value] !== "undefined") {
						throw `Tried to import something that has already been imported. Line ${token.lineNumber}`
					}
					currentImports[toImport.value] = ImportTable[toImport.value]
					break
				case "module":
					if(currentModule != null) {
						throw `Tried to start a module when one is already started. Line ${token.lineNumber}`
					}
					let moduleName = tokens.shift()
					if(typeof moduleName === "undefined") { throw `Reached EOF while making module at line ${token.lineNumber}` }
					if(moduleName.type !== TokenType.IDENTIFIER) { throw `Expected module name, got ${moduleName.value} at line ${token.lineNumber}` }
					currentModule = new DataflowModule(moduleName.value)
					Log.d(`Made a new module with the name ${moduleName.value}`)
				break
				case "input":
					let inputNode = getInletNode(token, tokens)
					if(currentModule == null) {
						throw `Tried to create an Inlet outside a module. Line ${token.lineNumber}`
					} else {
						currentModule.addInlet(inputNode)
					}
				break
				case "output":
					let outletNode = getOutletNode(token, tokens, currentImports)
					if(currentModule == null) {
						throw `Tried to create an Inlet outside a module. Line ${token.lineNumber}`
					} else {
						currentModule.addOutlet(outletNode)
					}
				break
				case "end":
					if(currentModule == null) {
						throw `Tried to end a module when we were not in one. Line ${token.lineNumber}`
					}
					modules[currentModule.name] = currentModule
					currentModule = null
				break
				default:
				throw `Unknown keyword ${token.value} at line ${token.lineNumber}`
			}
		} else if(token.type === TokenType.COMMENT) {
			Log.v(`Comment: ${token.value}`)
		} else if(token.type === TokenType.IDENTIFIER) {
			//Assignment
			let variable = getVariable(token, tokens, currentImports)
			if(currentModule == null) {
				throw `Tried to create a variable outside a module. Line ${token.lineNumber}`
			} else {
				currentModule.addVariable(variable)
			}
		} else {
			throw `Unknown token type ${TokenType[token.type]} at line ${token.lineNumber}`
		}
	}

	Log.i(`Done parsing!`)

	return modules
}

function getOutletNode(token: Token, tokens: Token[], currentImports: {[index: string]: {[index: string]: AtomicEvaluator}}): Outlet {
	let nodeName = tokens.shift()
	if(typeof nodeName === "undefined") { throw `Reached EOF while making Inlet at line ${token.lineNumber}` }
	if(nodeName.type !== TokenType.IDENTIFIER) { throw `Invalid token type ${TokenType[nodeName.type]} for the name of an inlet` }
	if(nodeName.value.indexOf(".") !== -1) {
		throw `Hierarchial assignment isn't supported in outlets line ${nodeName.lineNumber}`
	}
	let operator = tokens.shift()
	if(typeof operator === "undefined") { throw `Reached EOF while making outlet at line ${token.lineNumber}` }
	if(operator.value != "=") { throw `Invalid operator for outlet: ${operator.value} at line ${token.lineNumber}` }

	let rhs = tokens.shift()
	if(typeof rhs === "undefined") { throw `Reached EOF while making variable at line ${token.lineNumber}` }

	//Is this a direct assignment between two variables?
	if(rhs.value.indexOf(".") === -1) {
		return new GenericOutlet(token.value, [rhs.value], new PassthroughEvaluator())
	}

	//If not, we need to extract the evaluator
	let steps: string[] = rhs.value.split(".")
	if(steps.length != 2) {
		throw `Unable to make variable: RHS of operator has more than 1 "." at line ${token.lineNumber}`
	}
	if(typeof currentImports[steps[0]] === "undefined") {
		throw `Unknown module ${steps[0]}`
	}
	if(typeof currentImports[steps[0]][steps[1]] === "undefined") {
		throw `Unknown evaluator ${steps[1]}`
	}
	//Now we have to parse arguments
	let markerStart = tokens.shift()
	if(typeof markerStart === "undefined") { throw `Reached EOF while making variable at line ${token.lineNumber}` }
	if(markerStart.type !== TokenType.SEPARATOR) { throw `Expected (, got ${TokenType[token.type]} at line ${token.lineNumber}` }
	if(markerStart.value != "(") { throw `Expected (, got ${markerStart.value} at line ${token.lineNumber}` }

	let args = []
	
	while(true) {
		let argument = tokens.shift()
		if(typeof argument === "undefined") { throw `Reached EOF while making variable at line ${token.lineNumber}` }
		if(argument.type != TokenType.IDENTIFIER) { 
			if(argument.type === TokenType.SEPARATOR) {
				if(argument.value != ")") { throw `Expected (, got ${argument.value} at line ${argument.lineNumber}` }
				break
			} else {
				throw `Expected identifier, got ${TokenType[argument.type]} at line ${argument.lineNumber}`
			}
		}
		args.push(argument.value)
	}

	return new GenericOutlet(token.value, args, currentImports[steps[0]][steps[1]])
}


function getVariable(token: Token, tokens: Token[], currentImports: {[index: string]: {[index: string]: AtomicEvaluator}}): Variable {
	if(token.value.indexOf(".") !== -1) {
		throw `Hierarchial assignment isn't supported yet at line ${token.lineNumber}`
	}
	let operator = tokens.shift()
	if(typeof operator === "undefined") { throw `Reached EOF while making variable at line ${token.lineNumber}` }
	if(operator.value != "=") { throw `Invalid operator for variable: ${operator.value} at line ${token.lineNumber}` }

	let rhs = tokens.shift()
	if(typeof rhs === "undefined") { throw `Reached EOF while making variable at line ${token.lineNumber}` }

	//Is this a direct assignment between two variables?
	if(rhs.value.indexOf(".") === -1) {
		return new Variable(token.value, null, [rhs.value], new PassthroughEvaluator())
	}

	//If not, we need to extract the evaluator
	let steps: string[] = rhs.value.split(".")
	if(steps.length != 2) {
		throw `Unable to make variable: RHS of operator has more than 1 "." at line ${token.lineNumber}`
	}
	if(typeof currentImports[steps[0]] === "undefined") {
		throw `Unknown module ${steps[0]}`
	}
	if(typeof currentImports[steps[0]][steps[1]] === "undefined") {
		throw `Unknown evaluator ${steps[1]}`
	}
	//Now we have to parse arguments
	let markerStart = tokens.shift()
	if(typeof markerStart === "undefined") { throw `Reached EOF while making variable at line ${token.lineNumber}` }
	if(markerStart.type !== TokenType.SEPARATOR) { throw `Expected (, got ${TokenType[token.type]} at line ${token.lineNumber}` }
	if(markerStart.value != "(") { throw `Expected (, got ${markerStart.value} at line ${token.lineNumber}` }

	let args = []
	
	while(true) {
		let argument = tokens.shift()
		if(typeof argument === "undefined") { throw `Reached EOF while making variable at line ${token.lineNumber}` }
		if(argument.type != TokenType.IDENTIFIER) { 
			if(argument.type === TokenType.SEPARATOR) {
				if(argument.value != ")") { throw `Expected (, got ${argument.value} at line ${argument.lineNumber}` }
				break
			} else {
				throw `Expected identifier, got ${TokenType[argument.type]} at line ${argument.lineNumber}`
			}
		}
		args.push(argument.value)
	}

	return new Variable(token.value, null, args, currentImports[steps[0]][steps[1]])
}

function getInletNode(token: Token, tokens: Token[]): Inlet {
	Log.d("Making an input node")
	let nodeName = tokens.shift()
	if(typeof nodeName === "undefined") { throw `Reached EOF while making Inlet at line ${token.lineNumber}` }
	if(nodeName.type !== TokenType.IDENTIFIER) { throw `Invalid token type ${TokenType[nodeName.type]} for the name of an inlet` }

	let nextToken = tokens[0]
	if(typeof nextToken === "undefined") { throw `Reached EOF while making Inlet at line ${token.lineNumber}` }

	//If the next token is not an operator, we have reached the end of the inlet definition
	if(nextToken.type !== TokenType.OPERATOR) {
		return new ConstantValueInlet(nodeName.value, null)
	} 
	let operator = tokens.shift()
	if(typeof operator === "undefined") { throw `Reached EOF while making Inlet at line ${token.lineNumber}` }
	if(operator.value != "=") { throw `Invalid operator for creating inlets: ${operator.value} at line ${token.lineNumber}` }

	let rhs = tokens.shift()
	if(typeof rhs === "undefined") { throw `Reached EOF while making Inlet at line ${token.lineNumber}` }

	if(rhs.type === TokenType.LITERAL) {
		let booleanValues = ["true", "false"]
		if(booleanValues.indexOf(rhs.value) !== -1) {
			console.log(`its boolean, ${rhs.value}`)
			return new ConstantValueInlet(nodeName.value, (rhs.value == "true")?true:false)
		}
	}
	throw `Unable to make the Inlet node at line ${token.lineNumber}`
}

export function readModulesFromString(contents: string) {
	let lexemes = Lexemize(contents)
	Log.d(`Current lexemes: ${lexemes}`)
	let tokens = Tokenize(lexemes)

	let modules = InterpretTokens(tokens)
	return modules
}

export function readModulesFromFile(filename: string) {
	let contents = fs.readFileSync(filename,'utf8');
	return readModulesFromString(contents)
}


