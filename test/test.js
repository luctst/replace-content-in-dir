import test from "ava";
import replaceContentInDir from "../lib/index";
import { join } from "path";
import {accessSync, rmdirSync, mkdirSync} from "fs";

test.before("Create the folder to test", t => {
	try {
		mkdirSync(join(__dirname, "test"));
	} catch (error) {
		throw error.message;
	}
});

test("Test replaceContentInDir", async t => {
	await replaceContentInDir(join(__dirname, "test"));
	t.pass();
});


test.after("Delete the test/ folder", t => {
	try {
		accessSync(join(__dirname, "test"));
		rmdirSync(join(__dirname, "test"));
	} catch (error) {
		throw error.message;
	}
});

process.on('unhandledRejection', error => {
	throw error.message;
});
