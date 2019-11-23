console.log("foo")

import {readModulesFromString} from "./parser/parser"

export function ParseCode(code: string) {
	return readModulesFromString(code)
}