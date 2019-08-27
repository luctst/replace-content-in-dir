const {join} = require("path");
const {access} = require("fs");
const {promisify} = require("util");

module.exports = async (directoryToLoop, directoryToWrite, options) => {
	const toReturn = [];
	const rootPath = join(process.env.PWD, directoryToLoop);
	const accessPromisify = promisify(access);

	// Test first argument.
	if (typeof directoryToLoop !== "string") {
		throw new Error(`Enter string`);
	} else if (directoryToLoop === "") {
		throw new Error(`Enter a path as first argument.`);
	}

	await accessPromisify(rootPath);
	toReturn.push(rootPath);

	// If second argument exist test it.
	if (directoryToWrite !== undefined) {
		if (typeof directoryToWrite !== "object" && typeof directoryToWrite !== "string") {
			throw new Error("Second argument must be either an objet or a string.");
		}

		if (directoryToWrite === "") {
			throw new Error("Enter a valid path");
		}

		if (typeof directoryToWrite === "string") {
			const pathToWrite = join(directoryToWrite);

			await accessPromisify(pathToWrite);
			toReturn.push(directoryToWrite);
		}
	}

	// If the third argument is defined test it.
	if (options !== undefined) {
		if (typeof options !== "object") {
			throw new Error("The third argument must be an object");
		}

		if (Array.isArray(options)) {
			throw new Error("The third argument must be an object");
		}
	}

	return toReturn;
}
