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
const replaceContentinDir = async (dirToParse, pathToWrite = undefined, options = undefined) => {
	const paths = await checkErrors(dirToParse, pathToWrite, options);
	const readDirPromise = promisify(readdir);
	const functionHandler = {
		path: "", // Path to the sub folder directory.
		subFolder: [],
		three: {
			root: paths[0],
			files: [],
			children: []
		}
	};

	const dir = await readDirPromise(paths[0], { withFileTypes: true });

	dir.forEach(element => {
		if (element.isDirectory()) {
			function loopDeep(dirToLoop) {
				functionHandler.subFolder.push(dirToLoop);
				functionHandler.path = join(paths[0], functionHandler.subFolder.join("/"))

				const newDir = readdirSync(functionHandler.path, { withFileTypes: true });

				newDir.forEach(item => {
					if (item.isDirectory()) return loopDeep(item.name);
				})

				functionHandler.subFolder = [];
			};

			return loopDeep(element.name);
		}
	})
};

module.exports = replaceContentinDir;
