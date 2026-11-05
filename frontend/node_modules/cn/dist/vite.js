import { n as createBuilder } from "./build2.js";

//#region src/vite.ts
const cn = (options = {}) => {
	let builder = null;
	return {
		name: "cn:build",
		configResolved(config) {
			builder = createBuilder({
				cwd: config.root,
				...options
			});
		},
		async buildStart() {
			builder ??= createBuilder(options);
			await builder.run();
		},
		async watchChange(id, change) {
			if (change.event === "delete" || !builder) return;
			await builder.changed(id);
		}
	};
};

//#endregion
export { cn };