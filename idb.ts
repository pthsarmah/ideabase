import { $ } from 'bun';
import { program } from 'commander';

program
	.name("idb")
	.description("source control for your brilliant ideas!!")
	.version("0.0.1");

program
	.command('init')
	.description('Init a global repo of ideas')
	.argument('[directory]', 'Directory to store ideas')
	.action(async () => {
		await $`mkdir .idb`.quiet();
	});

//add ideas
program
	.command('add')
	.description('Add an idea')
	.argument('<idea>', 'your brilliant idea')
	.option('-d, --description', 'add an idea description')
	.option('--md, --markdown', 'markdown file for idea extraction')
	.action(() => {

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
