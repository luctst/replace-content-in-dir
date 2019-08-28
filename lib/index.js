const { readdir, readdirSync, readFile } = require("fs");
const { promisify } = require("util");
const {join} = require("path");
const checkErrors = require("./utils/checkErrors");
const copydir = require("copy-dir");

/**
 * Parse a directory to find files with dynamic content to be replace.
 * @param {String} dirToParse Path to the directory who contains files to be parsed.
 * @param {String} [pathToWrite] If present copy all the `dirToParse` directory with all the files updated to this path.
 * @param {Object} [options]
 */
const replaceContentinDir = async (dirToParse, pathToWrite = undefined, options = undefined) => {
	const paths = await checkErrors(dirToParse, pathToWrite, options);
	let opts = options !== undefined ? opts = {...options} : null;
	const readDirPromise = promisify(readdir);
	const functionHandler = {
		path: "", // Path to the sub folder directory.
		subFolder: [],
	};

	const dir = await readDirPromise(paths[0], { withFileTypes: true });

	if (pathToWrite !== undefined) {
		const options = {
			utimes: true,
			mode: true,
			cover: true,
		};

		copydir(paths[0], paths[1], options, err => {
			if (err) throw err;


		});
	}

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
