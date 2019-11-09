
//Legal variable types
export type FlowVariableType = string|number|boolean|null|FlowRecord

export type FlowRecord = {
	name: string,
	values: {[index: string]: FlowVariableType}
}
