console.log("Hi");

import fs from "fs";

import DataflowModule from "./engine/dataflowModule"
import Variable from "./engine/variable"

import ConstantValueInlet from "./engine/inlets/constantValueInlet"
import LogOutlet from "./engine/outlets/logOutlet"

import {BinaryAndEvaluator, BinaryOrEvaluator, BinaryXorEvaluator} from "./engine/evaluators/binaryLogic"

import {PassthroughEvaluator} from "./engine/evaluators/utils"

/*
//Adapters
let A = new ConstantValueInlet("A", true)
let B = new ConstantValueInlet("B", true)
let C = new ConstantValueInlet("C", false)

//Variables
let ABXor = new Variable("ABXor", null, ["A", "B"], new BinaryXorEvaluator())
let ABAnd = new Variable("ABAnd", null, ["A", "B"], new BinaryAndEvaluator())

let ABCXor = new Variable("ABCXor", null, ["ABXor", "C"], new BinaryOrEvaluator()) //This is the output
let ABCAnd = new Variable("ABCAnd", null, ["ABAnd", "C"], new BinaryAndEvaluator())

let CarryOut = new Variable("CarryOut", null, ["ABCAnd", "ABAnd"], new BinaryOrEvaluator())

//Outputs
let Out = new LogOutlet("Out", ["ABCXor"], new PassthroughEvaluator())
let Carry = new LogOutlet("Carry", ["CarryOut"], new PassthroughEvaluator())

//Set up engine
let engine = new DataflowModule([]);
engine.addInlet(A)
engine.addInlet(B)
engine.addInlet(C)

engine.addVariable(ABXor)
engine.addVariable(ABAnd)

engine.addVariable(ABCXor)
engine.addVariable(ABCAnd)

engine.addVariable(CarryOut)

engine.addOutlet(Out)
engine.addOutlet(Carry)

console.log("Running")

engine.run()

console.log("Done running")
*/
import {readModulesFromString} from "./parser/parser"

function readModulesFromFile(filename: string) {
	let contents = fs.readFileSync(filename,'utf8');
	return readModulesFromString(contents)
}


let modules = readModulesFromFile("testPrograms/parseTest.ppg")

modules["ParseTest"].run()

let adder = readModulesFromFile("testPrograms/binaryAdder.ppg")

adder["BinaryAdderBit"].run()