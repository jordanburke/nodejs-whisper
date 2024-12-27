import fs from 'fs'
import path from 'path'
import shell from 'shelljs'
import { MODELS } from './constants'

const WHISPER_CPP_PATH = path.join(__dirname, '..', 'cpp', 'whisper.cpp')
const WHISPER_CPP_MAIN_PATH = './main'
const projectDir = process.cwd()

export interface IShellOptions {
	silent: boolean
	async: boolean
}

const defaultShellOptions: IShellOptions = {
	silent: true,
	async: true,
}

function handleError(error: Error, logger = console) {
	logger.error('[Nodejs-whisper] Error:', error.message)
	shell.cd(projectDir)
	throw error
}

export async function whisperShell(
	command: string,
	options: IShellOptions = defaultShellOptions,
	logger = console
): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		shell.exec(command, options, (code, stdout, stderr) => {
			logger.debug('code---', code)
			logger.debug('stdout---', stdout)
			logger.debug('stderr---', stderr)

			if (code === 0) {
				if (stdout.includes('error:')) {
					reject(new Error('Error in whisper.cpp:\n' + stdout))
					return
				}

				logger.debug('stdout---', stdout)
				logger.debug('[Nodejs-whisper] Transcribing Done!')

				resolve(stdout)
			} else {
				reject(new Error(stderr))
			}
		})
	}).catch((error: Error) => {
		handleError(error)
		return Promise.reject(error)
	})
}

export async function executeCppCommand(command: string, logger = console, withCuda: boolean): Promise<string> {
	try {
		shell.cd(WHISPER_CPP_PATH)
		const mainPath = path.join(WHISPER_CPP_PATH, WHISPER_CPP_MAIN_PATH)

		if (!fs.existsSync(mainPath)) {
			logger.debug('[Nodejs-whisper] whisper.cpp not initialized.')
			const buildCmd = `cmake -B build && cmake --build build --config Release && cp build/bin/whisper-cli ${mainPath}`
			shell.exec(buildCmd)

			if (!fs.existsSync(mainPath)) {
				throw new Error('[Nodejs-whisper] Build failed - whisper-cli not found')
			}
		}
		return await whisperShell(command, defaultShellOptions, logger)
	} catch (error) {
		handleError(error as Error)
		throw error
	}
}