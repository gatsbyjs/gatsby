import * as fs from 'fs'

let is: boolean | string

function hasDockerEnv(): boolean {
	try {
    fs.statSync('/.dockerenv')

		return true
	} catch (_) {
		return false
	}
}

function hasDockerCGroup(): string | boolean {
	try {
		return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
	} catch (_) {
		return false;
	}
}

export default function (): boolean | string {
	if (is === undefined) {
		is = hasDockerEnv() || hasDockerCGroup();
	}

	return is;
}
