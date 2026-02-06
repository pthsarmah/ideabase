#!/usr/bin/env bun

import { program } from 'commander';
import { homedir } from 'node:os';
import fs from 'fs';
import { existsSync } from 'node:fs';
import { showHashesWithTitles, showIdeaViewer } from './tui';

program
	.name("idb")
	.description("source control for your brilliant ideas!!")
	.version("1.0.0");

program
	.command('init')
	.description('init a global repo of ideas')
	.action(async () => {
		fs.mkdir(`${homedir()}/.idb`, { recursive: true }, (err) => {
			if (err)
				console.error(`could not create .idb ${err}`);
		});
		Bun.write(`${homedir()}/.idb/ideas.json`, '[]');
	});

program
	.command('list')
	.description('list ideas')
	.option('-m, --marked', 'list only marked ideas')
	.option('-u, --unmarked', 'list only unmarked ideas')
	.option('-H, --hash', 'list only hashes with titles')
	.action(async (options) => {

		const ideasFile = `${homedir()}/.idb/ideas.json`;
		const ideasFileExists = await Bun.file(ideasFile).exists();

		if (!ideasFileExists) {
			console.error("ideas.json file does not exist");
			return;
		}

		var ideasJson: { hash: string, idea: string, description: string, marked: boolean }[] = await Bun.file(ideasFile).json();

		if (ideasJson.length <= 0) {
			console.error("No ideas available");
			return;
		}

		if (options.marked) {
			ideasJson = ideasJson.filter(i => i.marked);
		} else if (options.unmarked) {
			ideasJson = ideasJson.filter(i => !i.marked);
		}

		if (options.hash) {
			showHashesWithTitles(ideasJson);
			return;
		}

		showIdeaViewer(ideasJson.map(i => ({ idea: i.idea, description: i.description, marked: i.marked })))
	});

//add ideas
program
	.command('add')
	.description('add an idea')
	.argument('<idea>', 'your brilliant idea')
	.option('-d, --description <string>', 'add an idea description')
	.action(async (idea, options) => {
		if (!idea) { console.error("No idea provided"); return; }
		const description = options.description.trim();
		const body = `idea: ${idea}\ndescription: ${description ?? `no description`}`;
		const hash = new Bun.CryptoHasher("sha256").update(body).digest("hex");

		const ideasFile = `${homedir()}/.idb/ideas.json`;

		if (!existsSync(`${homedir()}/.idb`)) {
			console.error(".idb directory does not exist. Run 'init'");
			return;
		}

		const ideaFileExists = await Bun.file(ideasFile).exists();

		if (!ideaFileExists) {
			console.error("ideas.json file does not exist. Run 'init'");
		}

		const ideasJson: { hash: string, idea: string, description: string, marked: boolean }[] = await Bun.file(ideasFile).json();

		ideasJson.push({
			hash: hash,
			idea: idea,
			marked: false,
			description: description,
		});

		await Bun.write(ideasFile, JSON.stringify(ideasJson, null, 2));
	});

//edit ideas
program
	.command('edit')
	.description('edit an idea')
	.argument('<hash>', 'hash of your idea')
	.option('-t, --title <string>', 'new title')
	.option('-d, --description <string>', 'new description')
	.action(async (hash, options) => {
		const ideasFile = `${homedir()}/.idb/ideas.json`;

		if (!existsSync(`${homedir()}/.idb`)) {
			console.error(".idb directory does not exist. Run 'init'");
			return;
		}

		const ideaFileExists = await Bun.file(ideasFile).exists();

		if (!ideaFileExists) {
			console.error("ideas.json file does not exist. Run 'init'");
		}

		var ideasJson: { hash: string, idea: string, description: string, marked: boolean }[] = await Bun.file(ideasFile).json();

		const title = options.title.trim() ?? null;
		const description = options.description.trim() ?? null;

		if (hash?.length === 7)
			ideasJson = ideasJson.map(i => (i.hash.substring(0, 7) === hash ? { ...i, idea: title ?? i.idea, description: description ?? i.description } : i));
		else if (hash?.length === 64)
			ideasJson = ideasJson.map(i => (i.hash === hash ? { ...i, idea: title ?? i.idea, description: description ?? i.description } : i));
		else
			console.error("Invalid hash provided!");

		await Bun.write(ideasFile, JSON.stringify(ideasJson, null, 2));
	});

//mark idea as done
program
	.command('mark')
	.description('mark idea as done/complete')
	.argument('<hash>', 'hash of your idea')
	.action(async (hash) => {
		const ideasFile = `${homedir()}/.idb/ideas.json`;

		if (!existsSync(`${homedir()}/.idb`)) {
			console.error(".idb directory does not exist. Run 'init'");
			return;
		}

		const ideaFileExists = await Bun.file(ideasFile).exists();

		if (!ideaFileExists) {
			console.error("ideas.json file does not exist. Run 'init'");
		}

		var ideasJson: { hash: string, idea: string, description: string, marked: boolean }[] = await Bun.file(ideasFile).json();

		if (hash?.length === 7)
			ideasJson = ideasJson.map(i => (i.hash.substring(0, 7) === hash ? { ...i, marked: true } : i));
		else if (hash?.length === 64)
			ideasJson = ideasJson.map(i => (i.hash === hash ? { ...i, marked: true } : i));
		else
			console.error("Invalid hash provided!");

		await Bun.write(ideasFile, JSON.stringify(ideasJson, null, 2));
	});

program
	.command('unmark')
	.description('unmark idea from done/complete')
	.argument('<hash>', 'hash of your idea')
	.action(async (hash) => {
		const ideasFile = `${homedir()}/.idb/ideas.json`;

		if (!existsSync(`${homedir()}/.idb`)) {
			console.error(".idb directory does not exist. Run 'init'");
			return;
		}

		const ideaFileExists = await Bun.file(ideasFile).exists();

		if (!ideaFileExists) {
			console.error("ideas.json file does not exist. Run 'init'");
		}

		var ideasJson: { hash: string, idea: string, description: string, marked: boolean }[] = await Bun.file(ideasFile).json();

		if (hash?.length === 7)
			ideasJson = ideasJson.map(i => (i.hash.substring(0, 7) === hash ? { ...i, marked: false } : i));
		else if (hash?.length === 64)
			ideasJson = ideasJson.map(i => (i.hash === hash ? { ...i, marked: false } : i));
		else
			console.error("Invalid hash provided!");

		await Bun.write(ideasFile, JSON.stringify(ideasJson, null, 2));
	});

//remove idea
program
	.command('rm')
	.description('remove idea')
	.argument('<hash>', 'hash of your idea')
	.action(async (hash) => {
		const ideasFile = `${homedir()}/.idb/ideas.json`;

		if (!existsSync(`${homedir()}/.idb`)) {
			console.error(".idb directory does not exist. Run 'init'");
			return;
		}

		const ideaFileExists = await Bun.file(ideasFile).exists();

		if (!ideaFileExists) {
			console.error("ideas.json file does not exist. Run 'init'");
		}

		var ideasJson: { hash: string, idea: string, description: string, marked: boolean }[] = await Bun.file(ideasFile).json();

		if (hash?.length === 7)
			ideasJson = ideasJson.filter(i => i.hash.substring(0, 7) !== hash);
		else if (hash?.length === 64)
			ideasJson = ideasJson.filter(i => i.hash !== hash);
		else
			console.error("Invalid hash provided!");

		console.log(`Removed idea hashed ${hash}`);

		await Bun.write(ideasFile, JSON.stringify(ideasJson, null, 2));
	});

program
	.command('delete')
	.description('remove idea')
	.argument('<hash>', 'hash of your idea')
	.action(async (hash) => {
		const ideasFile = `${homedir()}/.idb/ideas.json`;

		if (!existsSync(`${homedir()}/.idb`)) {
			console.error(".idb directory does not exist. Run 'init'");
			return;
		}

		const ideaFileExists = await Bun.file(ideasFile).exists();

		if (!ideaFileExists) {
			console.error("ideas.json file does not exist. Run 'init'");
		}

		var ideasJson: { hash: string, idea: string, description: string, marked: boolean }[] = await Bun.file(ideasFile).json();

		if (hash?.length === 7)
			ideasJson = ideasJson.filter(i => i.hash.substring(0, 7) !== hash);
		else if (hash?.length === 64)
			ideasJson = ideasJson.filter(i => i.hash !== hash);
		else
			console.error("Invalid hash provided!");

		console.log(`Removed idea hashed ${hash}`);

		await Bun.write(ideasFile, JSON.stringify(ideasJson, null, 2));
	});

program.parse(process.argv);
