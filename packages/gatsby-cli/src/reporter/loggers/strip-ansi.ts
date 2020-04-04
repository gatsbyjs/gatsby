function ansiRegex({onlyFirst = false} = {}): RegExp {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|')

	return new RegExp(pattern, onlyFirst ? undefined : 'g')
}

export function stripAnsi(string) {
  return typeof string === 'string' ? string.replace(ansiRegex(), '') : string
}
