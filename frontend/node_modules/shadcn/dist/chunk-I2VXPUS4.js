import {McpServer}from'@modelcontextprotocol/server';import {searchRegistries,getRegistryItems}from'@shadcn/registry';import {withRegistryContext}from'@shadcn/registry/internal/registry/context';import {RegistryError}from'@shadcn/registry/internal/registry/errors';import {SEARCHABLE_TYPES,resolveSearchRegistries,findUnknownSearchTypes}from'@shadcn/registry/internal/registry/search';import m from'dedent';import {z}from'zod';import {getPackageRunner}from'@shadcn/registry/internal/get-package-manager';import {getRegistriesConfig}from'@shadcn/registry/internal/registry/api';var N="shadcn@latest";async function f(t){return `${await getPackageRunner(process.cwd())} ${N} ${t}`}async function u(t=process.cwd()){return {registries:(await getRegistriesConfig(t,{useCache:false})).registries}}async function w(t,e){let{query:n,registries:s}=e||{},c=await f("add"),r=t.items.map(p=>{let d=[`- ${p.name}`];return p.type&&d.push(`(${p.type})`),p.description&&d.push(`- ${p.description}`),p.registry&&d.push(`[${p.registry}]`),d.push(`
  Add command: \`${c} ${p.addCommandArgument}\``),d.join(" ")}),o=`Found ${t.pagination.total} items`;n&&(o+=` matching "${n}"`),s&&s.length>0&&(o+=` in registries ${s.join(", ")}`),o+=":";let g=`Showing items ${t.pagination.offset+1}-${Math.min(t.pagination.offset+t.pagination.limit,t.pagination.total)} of ${t.pagination.total}:`,h=`${o}

${g}

${r.join(`

`)}`;return t.pagination.hasMore&&(h+=`

More items available. Use offset: ${t.pagination.offset+t.pagination.limit} to see the next page.`),h}function $(t){if(!t?.length)return null;let e=findUnknownSearchTypes(t);return e.length===0?null:`Unknown type${e.length===1?"":"s"}: ${e.join(", ")}. Valid types: ${SEARCHABLE_TYPES.join(", ")}.`}function x(t){if(!t.errors?.length)return "";let e=t.errors.map(n=>`- ${n.registry}: ${n.message}`);return `

Skipped ${t.errors.length} registr${t.errors.length===1?"y":"ies"} that failed to load:
${e.join(`
`)}`}function b(t){return t.map(e=>[`## ${e.name}`,e.description?`
${e.description}
`:"",e.type?`**Type:** ${e.type}`:"",e.files&&e.files.length>0?`**Files:** ${e.files.length} file(s)`:"",e.dependencies&&e.dependencies.length>0?`**Dependencies:** ${e.dependencies.join(", ")}`:"",e.devDependencies&&e.devDependencies.length>0?`**Dev Dependencies:** ${e.devDependencies.join(", ")}`:""].filter(Boolean).join(`
`))}function C(t,e){let n=t.map(c=>{let r=[`## Example: ${c.name}`,c.description?`
${c.description}
`:""];return c.files?.length&&c.files.forEach(o=>{o.content&&(r.push(`### Code (${o.path}):
`),r.push("```tsx"),r.push(o.content),r.push("```"));}),r.filter(Boolean).join(`
`)});return `# Usage Examples

Found ${t.length} example${t.length>1?"s":""} matching "${e}":
`+n.join(`

---

`)}function D(){let t=new McpServer({name:"shadcn",version:"1.0.0"},{capabilities:{logging:{},tools:{listChanged:false}}});return L(t),t}async function U(t,e){console.error(e);try{await t.mcpReq.log("info",e);}catch{}}function l(t){return (e,n)=>withRegistryContext(async()=>{try{return await t(e)}catch(s){return G(s)}},{onGitHubAuthNotice:s=>U(n,s)})}function a(t){return {content:[{type:"text",text:t}]}}function y(t){return {content:[{type:"text",text:t}],isError:true}}function G(t){if(t instanceof RegistryError){let n=t.message;return t.suggestion&&(n+=`

\u{1F4A1} ${t.suggestion}`),t.context&&(n+=`

Context: ${JSON.stringify(t.context,null,2)}`),y(m`Error (${t.code}): ${n}`)}let e=t instanceof Error?t.message:String(t);return y(m`Error: ${e}`)}var j=m`No registries are configured. Add registries to components.json (use get_project_registries to inspect) or pass them explicitly.`,H=z.array(z.string()).optional().describe("Array of registry names to list (e.g., ['@shadcn', '@acme']). Omit to list from every registry configured in components.json."),k=z.array(z.string()).optional().describe("Array of registry names to search (e.g., ['@shadcn', '@acme']). Omit to search every registry configured in components.json."),T=z.array(z.string()).optional().describe(`Filter by item type. One of: ${SEARCHABLE_TYPES.join(", ")}.`),A=z.number().optional().describe("Maximum number of items to return (defaults to 100; use 0 for no limit)"),E=z.number().optional().describe("Number of items to skip for pagination");function L(t){t.registerTool("get_project_registries",{description:"Get configured registry names from components.json - Returns error if no components.json exists (use init_project to create one)",inputSchema:z.object({})},l(async()=>{let e=await u(process.cwd());return e?.registries?a(m`The following registries are configured in the current project:

        ${Object.keys(e.registries).map(n=>`- ${n}`).join(`
`)}

        You can view the items in a registry by running:
        \`${await f("view @name-of-registry")}\`

        For example: \`${await f("view @shadcn")}\` or \`${await f("view @shadcn @acme")}\` to view multiple registries.
        `):a(m`No components.json found or no registries configured.

          To fix this:
          1. Use the \`init\` command to create a components.json file
          2. Or manually create components.json with a registries section`)})),t.registerTool("list_items_in_registries",{description:"List items from registries (requires components.json - use init_project if missing)",inputSchema:z.object({registries:H,types:T,limit:A,offset:E})},l(async e=>{let n=$(e.types);if(n)return y(n);let s=await u(process.cwd()),c=!e.registries?.length,r=resolveSearchRegistries(e.registries??[],s);if(r.length===0)return a(j);let o=await searchRegistries(r,{types:e.types,limit:e.limit??100,offset:e.offset,config:s,useCache:!1,continueOnError:c}),g=x(o);return o.items.length===0?a(m`No items found in registries ${r.join(", ")}.${g}`):a(await w(o,{registries:r})+g)})),t.registerTool("search_items_in_registries",{description:"Search for components in registries using fuzzy matching (requires components.json). After finding an item, use get_item_examples_from_registries to see usage examples.",inputSchema:z.object({registries:k,query:z.string().describe("Search query string for fuzzy matching against item names and descriptions"),types:T,limit:A,offset:E})},l(async e=>{let n=$(e.types);if(n)return y(n);let s=await u(process.cwd()),c=!e.registries?.length,r=resolveSearchRegistries(e.registries??[],s);if(r.length===0)return a(j);let o=await searchRegistries(r,{query:e.query,types:e.types,limit:e.limit??100,offset:e.offset,config:s,useCache:!1,continueOnError:c}),g=x(o);return o.items.length===0?a(m`No items found matching "${e.query}" in registries ${r.join(", ")}, Try searching with a different query or registry.${g}`):a(await w(o,{query:e.query,registries:r})+g)})),t.registerTool("view_items_in_registries",{description:"View detailed information about specific registry items including the name, description, type and files content. For usage examples, use get_item_examples_from_registries instead.",inputSchema:z.object({items:z.array(z.string()).describe("Array of item names with registry prefix (e.g., ['@shadcn/button', '@shadcn/card'])")})},l(async e=>{let n=await getRegistryItems(e.items,{config:await u(process.cwd()),useCache:!1});if(n?.length===0)return a(m`No items found for: ${e.items.join(", ")}

          Make sure the item names are correct and include the registry prefix (e.g., @shadcn/button).`);let s=b(n);return a(m`Item Details:

        ${s.join(`

---

`)}`)})),t.registerTool("get_item_examples_from_registries",{description:"Find usage examples and demos with their complete code. Search for patterns like 'accordion-demo', 'button example', 'card-demo', etc. Returns full implementation code with dependencies.",inputSchema:z.object({registries:k,query:z.string().describe("Search query for examples (e.g., 'accordion-demo', 'button demo', 'card example', 'tooltip-demo', 'example-booking-form', 'example-hero'). Common patterns: '{item-name}-demo', '{item-name} example', 'example {item-name}'")})},l(async e=>{let n=await u(),s=!e.registries?.length,c=resolveSearchRegistries(e.registries??[],n);if(c.length===0)return a(j);let r=await searchRegistries(c,{query:e.query,config:n,useCache:!1,continueOnError:s});if(r.items.length===0)return a(m`No examples found for query "${e.query}".

          Try searching with patterns like:
          - "accordion-demo" for accordion examples
          - "button demo" or "button example"
          - Component name followed by "-demo" or "example"

          You can also:
          1. Use search_items_in_registries to find all items matching your query
          2. View the main component with view_items_in_registries for inline usage documentation`);let o=r.items.map(h=>h.addCommandArgument),g=await getRegistryItems(o,{config:n,useCache:!1});return a(C(g,e.query))})),t.registerTool("get_add_command_for_items",{description:"Get the shadcn CLI add command for specific items in a registry. This is useful for adding one or more components to your project.",inputSchema:z.object({items:z.array(z.string()).describe("Array of items to get the add command for prefixed with the registry name (e.g., ['@shadcn/button', '@shadcn/card'])")})},l(async e=>a(await f(`add ${e.items.join(" ")}`)))),t.registerTool("get_audit_checklist",{description:"After creating new components or generating new code files, use this tool for a quick checklist to verify that everything is working as expected. Make sure to run the tool after all required steps have been completed.",inputSchema:z.object({})},l(async()=>a(m`## Component Audit Checklist

        After adding or generating components, check the following common issues:

        - [ ] Ensure imports are correct i.e named vs default imports
        - [ ] If using next/image, ensure images.remotePatterns next.config.js is configured correctly.
        - [ ] Ensure all dependencies are installed.
        - [ ] Check for linting errors or warnings
        - [ ] Check for TypeScript errors
        - [ ] Use the Playwright MCP if available.
        `)));}var ie=D();export{D as a,ie as b};