import {existsSync}from'fs';import u from'path';function a(t){let i=u.basename(t);return /^\.env(\.|$)/.test(i)}function m(t){let i=[".env.local",".env",".env.development.local",".env.development"];for(let s of i){let r=u.join(t,s);if(existsSync(r))return r}return null}function c(t){let i=t.split(`
`),s={};for(let r of i){let n=r.trim();if(!n||n.startsWith("#"))continue;let e=n.indexOf("=");if(e===-1)continue;let o=n.substring(0,e).trim(),f=n.substring(e+1).trim();o&&(s[o]=f.replace(/^["']|["']$/g,""));}return s}function p(t,i){let s=c(t),r=c(i),n=[];for(let e of Object.keys(r))e in s||n.push(e);return n}function E(t,i){let s=c(t),r=c(i),n=t.trimEnd();n&&!n.endsWith(`
`)&&(n+=`
`);let e=[];for(let[o,f]of Object.entries(r))o in s||e.push(`${o}=${f}`);return e.length>0?(n&&(n+=`
`),n+=e.join(`
`),n+`
`):n}export{a,m as b,c,p as d,E as e};