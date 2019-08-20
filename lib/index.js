const { readdir, lstatSync, readdirSync, createReadStream, createWriteStream } = require("fs");
const { promisify } = require("util");
const { join, basename } = require("path");
const chalk = require("chalk");

const readDirPromise = promisify(readdir);
const functionHandler = {
	path: "",
	subFolder: []
};

/**
 *
 * @param {String} dirToLoop
 */
function loopDeep(dirToLoop) {
	functionHandler.subFolder.push(dirToLoop);

	functionHandler.path = join(directory, `${functionHandler.subFolder.join("/")}`)

	const newDir = readdirSync(functionHandler.path, { withFileTypes: true });

	newDir.forEach(item => {
		if (item.isDirectory()) {
			return loopDeep(item.name)
		}
		parseAndCreateFile(join(functionHandler.path, item.name));
	})

	functionHandler.subFolder = [];
}

/**
 *
 * @param {String} pathToFile
 */
function parseAndCreateFile(pathToFile) {
	const fileToRead = createReadStream(pathToFile);
	const fileToWrite = createWriteStream(`${process.env.PWD}/${basename(pathToFile)}`);
	let data;

	fileToRead.on('data', d => {
		data = d.toString();
	}).on("end", () => {
		fileToRead.pipe(fileToWrite);
	});
};

module.exports = async (directory, options) => {
	const stat = lstatSync(directory);

	if (stat.isDirectory() || stat.isSymbolicLink()) {
		const dir = await readDirPromise(directory, { withFileTypes: true });

		dir.forEach(element => {
			if (element.isDirectory()) return loopDeep(element.name);
			parseAndCreateFile(join(directory, element.name));
		})
	} else {
		throw new Error(`The path enter is not a directory ${chalk.red(directory)}`);
	}
};
