const { readdir, lstat, readdirSync, createReadStream, createWriteStream } = require("fs");
const { promisify } = require("util");
const { join, basename } = require("path");

const lsStatPromise = promisify(lstat);
const readDirPromise = promisify(readdir);
const functionHandler = {
	cwd: "",
	path: "",
	pathToWrite: "",
	subFolder: []
};

/**
 * Loop depth inside all sub folder. called recursively until all folders have been parsed.
 * @param {String} dirToLoop The folder name to be loop.
 */
function loopDeep(dirToLoop) {
	functionHandler.subFolder.push(dirToLoop);
	functionHandler.path = join(functionHandler.cwd, `${functionHandler.subFolder.join("/")}`)

	const newDir = readdirSync(functionHandler.path, { withFileTypes: true });

	newDir.forEach(item => {
		if (item.isDirectory()) return loopDeep(item.name);
		parseAndCreateFile(`${functionHandler.path}/${item.name}`, functionHandler.pathToWrite);
	})

	functionHandler.subFolder = [];
}

/**
 *
 * @param {String} pathToFileToRead
 * @param {String} pathToFileToWrite
 */
function parseAndCreateFile(pathToFileToRead, pathTofileToWrite) {
	console.log(pathToFileToRead);
	const fileRead = createReadStream(pathToFileToRead);
	// const fileWrite = createWriteStream(`${pathTofileToWrite}/${basename(pathToFileToRead)}`);
};

/**
 * Parse a directory to find files with dynamic content to be replace.
 * @param {String} dirToParse Path to the directory who contains files to be parsed.
 * @param {String} [pathToWrite] If present copy all the `dirToParse` directory with all the files updated to this path.
 * @param {Object} [options]
 */
module.exports = async (dirToParse, pathToWrite, options = {}) => {
	if (dirToParse === "") throw new Error("Enter a path");

	functionHandler.cwd = join(process.env.PWD, dirToParse);

	// Check if path exists.
	const directoryToParse = await lsStatPromise(functionHandler.cwd);
	const checkPathtoWrite = await lsStatPromise(pathToWrite);

	// Check if path are directory
	if (directoryToParse.isFile() || checkPathtoWrite.isFile()) {
		throw new Error(`Enter a valid path`);
	}

	functionHandler.pathToWrite = pathToWrite;
	const dir = await readDirPromise(functionHandler.cwd, { withFileTypes: true });

	dir.forEach(element => {
		if (element.isDirectory()) return loopDeep(element.name);
		parseAndCreateFile(`${functionHandler.cwd}/${element.name}`, functionHandler.pathToWrite);
	})
};
