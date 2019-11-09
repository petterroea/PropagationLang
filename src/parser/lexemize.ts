import Log from "../log"

export default function Lexemize(code: string) {
	let lexemeList = []

	let current = ""
	let inString = false
	let inComment = false
	let currentLine = 1
	let spaceCharacters = [" ", "\t"]

	for(let character of code) {
		if(inString) {
			//Handle string parsing
			if(character != "\"") {
				current += character
			} else {
				inString = false
				lexemeList.push({lexeme: current, line: currentLine})
				current = ""
			}
		} else if(inComment) {
			if(character == "\n") {
				inComment = false
				if(current.length > 0) {
					lexemeList.push({lexeme: current, line: currentLine})
					current = ""
				}
			} else {
				current += character
			}		
		} else {
			if(character == "#") {
				inComment = true
				if(current.length > 0) {
					lexemeList.push({lexeme: current, line: currentLine})
				}
				current = "#"
			} else if(character == "\n") {
				currentLine++
				if(current.length > 0) {
					lexemeList.push({lexeme: current, line: currentLine})
					current = ""
				}		
			} else if(spaceCharacters.indexOf(character) > -1) {
				if(current.length > 0) {
					lexemeList.push({lexeme: current, line: currentLine})
					current = ""
				}
			} else if(character == "\"") {
				inString = true
				if(current.length > 0) {
					lexemeList.push({lexeme: current, line: currentLine})
					current = ""
				}
			} else if(character == "(" || character == ")") {
				if(current.length > 0) {
					lexemeList.push({lexeme: current, line: currentLine})
					current = ""
				}
				lexemeList.push({lexeme: character, line: currentLine})
			/*} else if(character == ",") {
				if(current.length > 0) {
					lexemeList.push(current)
					current = ""
				}
				lexemeList.push(",")*/
			} else {
				current += character
			}
		}
	}
	if(current.length > 0) {
		lexemeList.push({lexeme: current, line: currentLine})
		current = ""
	}
	return lexemeList
}