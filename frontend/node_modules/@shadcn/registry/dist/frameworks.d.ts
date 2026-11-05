declare const FRAMEWORKS: {
    readonly "next-app": {
        readonly name: "next-app";
        readonly label: "Next.js";
        readonly links: {
            readonly installation: `${string}/docs/installation/next`;
            readonly tailwind: "https://tailwindcss.com/docs/guides/nextjs";
        };
    };
    readonly "next-pages": {
        readonly name: "next-pages";
        readonly label: "Next.js";
        readonly links: {
            readonly installation: `${string}/docs/installation/next`;
            readonly tailwind: "https://tailwindcss.com/docs/guides/nextjs";
        };
    };
    readonly remix: {
        readonly name: "remix";
        readonly label: "Remix";
        readonly links: {
            readonly installation: `${string}/docs/installation/remix`;
            readonly tailwind: "https://tailwindcss.com/docs/guides/remix";
        };
    };
    readonly "react-router": {
        readonly name: "react-router";
        readonly label: "React Router";
        readonly links: {
            readonly installation: `${string}/docs/installation/react-router`;
            readonly tailwind: "https://tailwindcss.com/docs/installation/framework-guides/react-router";
        };
    };
    readonly vite: {
        readonly name: "vite";
        readonly label: "Vite";
        readonly links: {
            readonly installation: `${string}/docs/installation/vite`;
            readonly tailwind: "https://tailwindcss.com/docs/guides/vite";
        };
    };
    readonly astro: {
        readonly name: "astro";
        readonly label: "Astro";
        readonly links: {
            readonly installation: `${string}/docs/installation/astro`;
            readonly tailwind: "https://tailwindcss.com/docs/guides/astro";
        };
    };
    readonly laravel: {
        readonly name: "laravel";
        readonly label: "Laravel";
        readonly links: {
            readonly installation: `${string}/docs/installation/laravel`;
            readonly tailwind: "https://tailwindcss.com/docs/guides/laravel";
        };
    };
    readonly "tanstack-start": {
        readonly name: "tanstack-start";
        readonly label: "TanStack Start";
        readonly links: {
            readonly installation: `${string}/docs/installation/tanstack`;
            readonly tailwind: "https://tailwindcss.com/docs/installation/using-postcss";
        };
    };
    readonly gatsby: {
        readonly name: "gatsby";
        readonly label: "Gatsby";
        readonly links: {
            readonly installation: `${string}/docs/installation/gatsby`;
            readonly tailwind: "https://tailwindcss.com/docs/guides/gatsby";
        };
    };
    readonly expo: {
        readonly name: "expo";
        readonly label: "Expo";
        readonly links: {
            readonly installation: `${string}/docs/installation/expo`;
            readonly tailwind: "https://www.nativewind.dev/docs/getting-started/installation";
        };
    };
    readonly manual: {
        readonly name: "manual";
        readonly label: "Manual";
        readonly links: {
            readonly installation: `${string}/docs/installation/manual`;
            readonly tailwind: "https://tailwindcss.com/docs/installation";
        };
    };
};
type Framework = (typeof FRAMEWORKS)[keyof typeof FRAMEWORKS];

export { FRAMEWORKS, type Framework };
