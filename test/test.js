import test from "ava";
import replace from "../lib/index";
import { join } from "path";
import {rmdirSync, mkdirSync} from "fs";

const path = join(__dirname, "test");

test.before("Create the folder to test", t => {
	try {
		mkdirSync(path);
	} catch (error) {
		rmdirSync(join(__dirname, "test"));
		throw error.message;
	}
});

test.serial("series of tests with replace who should return Error", async t => {
	await t.throwsAsync(async () => {
		await replace("");
	}, {
		instanceOf: Error
	}, "Error first argument can't be an empty string");

	await t.throwsAsync(async () => {
		await replace({});
	}, {
		instanceOf: Error
	}, "Error first argument must be type of string")

	await t.throwsAsync(async () => {
		await replace("fake-folder");
	}, {
		instanceOf: Error
	}, "Error first argument must be a valide path");

	await t.throwsAsync(async () => {
		await replace(".github", () => {});
	},{
		instanceOf: Error
	}, "Error second argument must be either a string or an object");

	await t.throwsAsync(async () => {
		await replace(".github", "");
	}, {
		instanceOf: Error
	}, "Error second argument can't be an empty string");
});

test.serial("series of tests with replace who shouldn't return some Errors", async t => {
	await t.notThrowsAsync(async () => {
		await replace(".github");
	}, "First argument is correct");
});

test.serial.skip("Check if with one valid argument return an array with one item", async t => {
	await t.notThrowsAsync(async () => {
		const f = await replace(".github");

		if (!Array.isArray(f)) {
			t.fail("replace must return an array");
		}

		if (f.length === 1) {
			t.pass("replace return an array");
		}
	});
});

test.serial.skip("Check if with two valid arguments return an array with two item", async t => {
	await t.notThrowsAsync(async () => {
		const f = await replace(".github", "test");

		t.log(f);
		if (!Array.isArray(f)) {
			t.fail("replace must return an array");
		}

		if (f.length === 2) {
			t.pass("replace return an array");
		}
	});
});

test.after("Delete the test/ folder", t => {
	try {
		rmdirSync(path);
	} catch (error) {
		throw error.message;
	}
});
