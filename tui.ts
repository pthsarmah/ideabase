import { BoxRenderable, CliRenderer, createCliRenderer, delegate, RGBA, SelectRenderable, TextRenderable } from "@opentui/core";

const transparent = new RGBA(new Float32Array([0, 0, 0, 0]));

const createIdeaViewer = (renderer: CliRenderer, options: { idea: string, description: string, marked: boolean }[]) => {
	const ideaViewer = new SelectRenderable(renderer, {
		id: "id-viewer",
		width: `100%`,
		height: `100%`,
		margin: 3,
		backgroundColor: transparent,
		selectedBackgroundColor: transparent,
		focusedBackgroundColor: transparent,
		itemSpacing: 1,
		options: Array.from(options).map(o => ({
			name: `${o.marked ? "✅ " : ""}${o.idea}`,
			description: o.description,
		})),
	});

	return ideaViewer;
}

const colorHash = (hash: string, marked: boolean) => {
	const short = hash.substring(0, 7);
	const rgb = { r: 246, g: 116, b: 0 }; // #f67400
	const supportsTrueColor = !!process.env.COLORTERM && /truecolor|24bit/i.test(process.env.COLORTERM);

	if (supportsTrueColor && process.stdout.isTTY) {
		return marked ? `\x1b[32m${short}\x1b[0m` : `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${short}\x1b[0m`;
	} else if (process.stdout.isTTY) {
		return marked ? `\x1b[32m${short}\x1b[0m` : `\x1b[33m${short}\x1b[0m`;
	} else {
		return short;
	}
}

const formatLine = (item: { idea: string, hash: string, marked: boolean }) => {
	const colored = colorHash(item.hash, item.marked);
	return `${colored}  ${item.marked ? `\x1b[32m${item.idea}\x1b[0m` : item.idea}\n`;
}

export const showHashesWithTitles = async (items: { idea: string, hash: string, marked: boolean }[]) => {
	if (!items || items.length === 0) {
		process.stdout.write('');
		return;
	}

	for (const it of items) {
		process.stdout.write(formatLine(it));
	}
};

export const showIdeaViewer = async (options: { idea: string, description: string, marked: boolean }[]) => {
	const renderer = await createCliRenderer();
	const ideaViewer = createIdeaViewer(renderer, options);
	ideaViewer.focus();
	renderer.root.add(ideaViewer);
}
