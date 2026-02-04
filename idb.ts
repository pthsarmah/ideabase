#!/usr/bin/env bun

import { program } from 'commander';
import { tmpdir } from 'node:os';
import fs from 'fs';
import { existsSync } from 'node:fs';
import { showIdeaViewer } from './tui';

program
	.name("idb")
	.description("source control for your brilliant ideas!!")
	.version("0.0.1");

program
	.command('init')
	.description('Init a global repo of ideas')
	.action(async () => {
		fs.mkdir(`${tmpdir()}/.idb`, { recursive: true }, (err) => {
			if (err)
				console.error(`could not create .idb ${err}`);
		});
		Bun.write(`${tmpdir()}/.idb/ideas.json`, '[]');
	});

program
	.command('list')
	.description('List ideas')
	.option('-m', 'list only marked ideas')
	.option('-a', 'list all ideas')
	.action(async () => {
		const ideasFile = `${tmpdir()}/.idb/ideas.json`;
		const ideasFileExists = await Bun.file(ideasFile).exists();

		if (!ideasFileExists) {
			console.error("ideas.json file does not exist");
			return;
		}

		const ideasJson: { hash: string, idea: string, description: string }[] = await Bun.file(ideasFile).json();

		showIdeaViewer(ideasJson.map(i => ({ idea: i.idea, description: i.description })))
	});

//add ideas
program
	.command('add')
	.description('Add an idea')
	.argument('<idea>', 'your brilliant idea')
	.option('-d, --description <string>', 'add an idea description')
	.action(async (idea, options) => {
		if (!idea) { console.error("No idea provided"); return; }
		const description = options.description;
		const body = `idea: ${idea}\ndescription: ${description ?? `no description`}`;
		const hash = new Bun.CryptoHasher("sha256").update(body).digest("hex");

		const ideasFile = `${tmpdir()}/.idb/ideas.json`;

		if (!existsSync(`${tmpdir()}/.idb`)) {
			console.error(".idb directory does not exist. Run 'init'");
			return;
		}

		const ideaFileExists = await Bun.file(ideasFile).exists();

		if (!ideaFileExists) {
			console.error("ideas.json file does not exist. Run 'init'");
		}

		const ideasJson: { hash: string, idea: string, description: string }[] = await Bun.file(ideasFile).json();

		ideasJson.push({
			hash: hash,
			idea: idea,
			description: description,
		});

		await Bun.write(ideasFile, JSON.stringify(ideasJson, null, 2));
	});

//edit ideas
program
	.command('edit')
	.description('Edit an ideas')
	.argument('<hash>', 'hash of your idea')
	.argument('-t, --title', 'new title')
	.argument('-d, --description', 'new description')
	.action(() => {

	});

//mark idea as done
program
	.command('mark')
	.description('Mark idea as done/complete')
	.argument('<hash>', 'hash of your idea')
	.action(() => {

	});

//remove idea
program
	.command('rm')
	.command('remove')
	.description('Remove idea')
	.argument('<hash>', 'hash of your idea')
	.action(() => {

	});

program.parse();
