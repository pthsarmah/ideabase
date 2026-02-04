import { CliRenderer, createCliRenderer, RGBA, SelectRenderable } from "@opentui/core";

const transparent = new RGBA(new Float32Array([0, 0, 0, 0]));

const createIdeaViewer = (renderer: CliRenderer, options: { idea: string, description: string }[]) => {
	const ideaViewer = new SelectRenderable(renderer, {
		id: "id-viewer",
		width: `100%`,
		height: 8,
		margin: 3,
		backgroundColor: transparent,
		selectedBackgroundColor: transparent,
		focusedBackgroundColor: transparent,
		options: Array.from(options).map(o => ({
			name: o.idea,
			description: o.description,
		})),
	});

	return ideaViewer;
}

export const showIdeaViewer = async (options: { idea: string, description: string }[]) => {
	const renderer = await createCliRenderer();
	const ideaViewer = createIdeaViewer(renderer, options);
	ideaViewer.focus();
	renderer.root.add(ideaViewer);
}
