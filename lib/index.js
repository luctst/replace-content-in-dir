const { readdir, lstat, readdirSync, createReadStream, createWriteStream, access } = require("fs");
const { promisify } = require("util");
const { join, basename, dirname } = require("path");
const chalk = require("chalk");

const lsStatPromise = promisify(lstat);
const readDirPromise = promisify(readdir);
const accessPromise = promisify(access);
const functionHandler = {
	cwd: process.env.PWD,
	path: "",
	pathToWrite: "",
	subFolder: []
};

/**
 *
 * @param {String} dirToLoop
 */
function loopDeep(dirToLoop) {
	functionHandler.subFolder.push(dirToLoop);
	functionHandler.path = join(functionHandler.cwd, `${functionHandler.subFolder.join("/")}`)

	const newDir = readdirSync(functionHandler.path, { withFileTypes: true });

	newDir.forEach(item => {
		if (item.isDirectory()) {
			return loopDeep(item.name)
		}
		parseAndCreateFile(join(functionHandler.path, item.name), functionHandler.pathToWrite);
	})

	functionHandler.subFolder = [];
}

/**
 *
 * @param {String} pathToFile
 */
function parseAndCreateFile(pathToFile, pathToWrite) {
	const fileToRead = createReadStream(pathToFile);
	const fileToWrite = createWriteStream(`${pathToWrite}/${basename(pathToFile)}`);
	let data;
};

/**
 * Parse a directory to find files with dynamic content to be replace.
 * @param {String} dirToParse Path to the directory who contains files to be parsed.
 * @param {String} [pathToWrite] If present copy all the `dirToParse` directory with all the files updated to this path.
 * @param {Object} [options]
 */
module.exports = async (dirToParse, pathToWrite, options = {}) => {
	const pathToDirToParse = join(functionHandler.cwd, dirToParse);
	const directoryToParse = await lsStatPromise(pathToDirToParse);
	const checkPathToWrite = await lsStatPromise(pathToWrite);

	// Executes some tests to check if the first argument is correct.
	if (directoryToParse.isFile()) {
		throw new Error(`The path enter is not a directory ${chalk.red(dirToParse)}`);
	}

	// Same but for the second argument.
	if (checkPathToWrite.isFile()) {
		throw new Error(`The path enter is a file you should enter a directory ${chalk.red(pathToWrite)}`);
	} else if (await !accessPromise(dirname(pathToWrite))) {
		throw new Error(`The path enter is not correct, ${chalk.red(pathToWrite)}`);
	}

	if (directoryToParse.isDirectory() || directoryToParse.isSymbolicLink()) {
		const dir = await readDirPromise(pathToDirToParse, { withFileTypes: true });

		dir.forEach(element => {
			if (element.isDirectory()) return loopDeep(element.name);

			parseAndCreateFile(join(pathToDirToParse, element.name), functionHandler.pathToWrite);
		})
	}
};
