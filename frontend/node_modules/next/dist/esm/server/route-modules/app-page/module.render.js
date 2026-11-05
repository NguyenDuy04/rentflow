function getAppPageModule() {
    if (process.env.NEXT_MINIMAL) {
        throw new Error("Can't use lazyRenderAppPage in minimal mode");
    } else {
        return require('./module.compiled');
    }
}
export const lazyRenderAppPage = (...args)=>{
    const render = getAppPageModule().renderToHTMLOrFlight;
    return render(...args);
};
export const lazyPrerenderAppPage = (...args)=>{
    const prerender = getAppPageModule().prerenderToHTMLOrFlight;
    return prerender(...args);
};

//# sourceMappingURL=module.render.js.map