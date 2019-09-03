import test from "ava";
import { join } from "path";
import {mkdir} from "fs";
import replace from "../lib/index";
import checkErrors from "../lib/utils/checkErrors";
import rimraf from "rimraf";
import {compare} from "dir-compare";

const path = join(__dirname, "test");

test.before.cb("Create the folder to test", t => {
	try {
		mkdir(path, (err) => {
			if (err) throw err;
			t.end();
		});
	} catch (error) {
		rimraf(path, err => {
			if (err) throw err
		});
	}
});

test.serial("Should throw an error", async t => {
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

	await t.throwsAsync(async () => {
		await replace(".github", "test", []);
	}, {
		instanceOf: Error
	}, "Error third argument must be an object");
});

test.serial("Shouldn't throw an error", async t => {
	await t.notThrowsAsync(async () => {
		await checkErrors(".github", undefined, {});
	}, "First argument is correct");
});

test("checkErrors, one valid argument return an array with one item", async t => {
	await t.notThrowsAsync(async () => {
		const f = await checkErrors(".github", undefined, {});

		if (!Array.isArray(f)) {
			t.fail("replace must return an array");
		}

		if (f.length === 1) {
			t.pass("replace return an array");
		}
	});
});

test("checkErrors, two valid arguments return an array with two item", async t => {
	await t.notThrowsAsync(async () => {
		const f = await checkErrors(".github", "test", {});

		if (!Array.isArray(f)) {
			t.fail("replace must return an array");
		}

		if (f.length === 2) {
			t.pass("replace return an array");
		}
	});
});

test("Copy test/folder-a and check if test/test has the same structure without any options", async t => {
	await replace("test/folder-a", path, {});
	const res = await compare(path, "test/folder-a");

	if (res.same) return t.pass();

	t.fail();
});

test.after.always.cb("Delete the test/ folder", t => {
	rimraf(path, err => {
		if (err) throw err;
		t.end();
	});
});
