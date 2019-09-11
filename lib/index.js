const { readdir, readdirSync, createReadStream, createWriteStream, readFile } = require("fs");
const { promisify } = require("util");
const {join, dirname, basename} = require("path");
const checkErrors = require("./utils/checkErrors");
const copydir = require("copy-dir");
const chalk = require("chalk");

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
	};

	const dir = await readDirPromise(paths[0], { withFileTypes: true });

	// Check if directory must be created.
	if (pathToWrite !== undefined) {
		const opts = {
			utimes: true,
			mode: true,
			cover: true,
			filter: (stat, filepath, filename) => {
				if (stat === "file") {
					const rootFolder = basename(dirToParse);
					const pathWriteStream = join(paths[1], dirname(filepath.split(rootFolder)[1]), basename(filepath));
					const rs = createReadStream(filepath);

					rs
					.on("error", error => error)
					.once("open", () => {
						const ws = createWriteStream(pathWriteStream);

						ws
						.on("error", error => error)
						.on("open", () => {
							const p = rs.pipe(ws);

							readFile(pathWriteStream, (err, data) => {
								if (err) throw err;

								let content = data.toString();
								const contentToReplace = data.toString().match(/\{\{(.*?)\}\}/g);

								if (contentToReplace !== null) {
									contentToReplace.forEach(item => {
									});
								}
							});
						});
					})


					return false;
				}

				console.log(`${chalk.bgYellow.black(basename(filepath))} - directory correctly created. \n`);
				return true;
			}
		};

		return copydir(paths[0], paths[1], opts, err => {
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
