import Log from "../log"

export enum TokenType {
	KEYWORD,
	IDENTIFIER,
	LITERAL,
	OPERATOR,
	SEPARATOR,
	COMMENT
}

let operatorList = ["="]
let separatorList = ["(", ")"]
let booleanList = ["true", "false"]

export class Token {
	constructor(public type: TokenType, public value: string, public lineNumber: number) {

	}
}

export default function Tokenize(lexemes: {lexeme: string, line: number}[]) {
	let tokenList = []

	for(let lexeme of lexemes) {
		let token = lexeme.lexeme
		Log.d(token)
		if(token.charAt(0) == "@") {
			tokenList.push(new Token(TokenType.KEYWORD, token.substring(1), lexeme.line))
		} else if(token.charAt(0) == "#") {
			tokenList.push(new Token(TokenType.COMMENT, token.substring(1).trim(), lexeme.line))
		} else if(operatorList.indexOf(token) !== -1) {
			tokenList.push(new Token(TokenType.OPERATOR, token, lexeme.line))
		} else if(separatorList.indexOf(token) !== -1) {
			tokenList.push(new Token(TokenType.SEPARATOR, token, lexeme.line))
		} else if(booleanList.indexOf(token) !== -1 || !isNaN(+token) ) {
			tokenList.push(new Token(TokenType.LITERAL, token, lexeme.line))		
		} else {
			tokenList.push(new Token(TokenType.IDENTIFIER, token, lexeme.line))
		}
	}

	let tokenStrings = tokenList.map((tok) => {
		return TokenType[tok.type] + `(${tok.value})`
	})

	console.log(`Tokens: ${tokenStrings}`)

	return tokenList
}