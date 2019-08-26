const { readdir, readdirSync } = require("fs");
const { promisify } = require("util");
const { join} = require("path");
const checkErrors = require("./utils/checkErrors");

/**
 * Parse a directory to find files with dynamic content to be replace.
 * @param {String} dirToParse Path to the directory who contains files to be parsed.
 * @param {String} [pathToWrite] If present copy all the `dirToParse` directory with all the files updated to this path.
 * @param {Object} [options]
 */
module.exports = async (dirToParse, pathToWrite = null, options = {}) => {
	const paths = await checkErrors(dirToParse, pathToWrite);
	const readDirPromise = promisify(readdir);
	const functionHandler = {
		cwd: "", // Path to the directory to start looping.
		path: "", // Path to the sub folder directory.
		pathToWrite: "", // Path to the dir to write.
		subFolder: []
	};

	functionHandler.pathToWrite = pathToWrite;
	const dir = await readDirPromise(functionHandler.cwd, { withFileTypes: true });

	dir.forEach(element => {
		if (element.isDirectory()) {
			function loopDeep(dirToLoop) {
				functionHandler.subFolder.push(dirToLoop);
				functionHandler.path = join(functionHandler.cwd, `${functionHandler.subFolder.join("/")}`)

				const newDir = readdirSync(functionHandler.path, { withFileTypes: true });

				newDir.forEach(item => {
					if (item.isDirectory()) return loopDeep(item.name);
					parseAndCreateFile(`${functionHandler.path}/${item.name}`, functionHandler.pathToWrite);
				})

				functionHandler.subFolder = [];
			};

			return loopDeep(dirToLoop);
		}
	})
};
