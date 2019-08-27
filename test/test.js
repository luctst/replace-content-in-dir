import test from "ava";
import replace from "../lib/index";
import checkErrors from "../lib/utils/checkErrors";

test("Should throw an error", async t => {
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

test("Shouldn't throw an error", async t => {
	await t.notThrowsAsync(async () => {
		await checkErrors(".github", undefined, {});
	}, "First argument is correct");
});

test("One valid argument return an array with one item", async t => {
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

test("Two valid arguments return an array with two item", async t => {
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

test("To write", async t => {
	t.log(await replace(".github"));
	t.pass();
});
