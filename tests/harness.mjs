import vm from 'node:vm';
import fs from 'node:fs';
export function load(name) {
  const workflow = JSON.parse(fs.readFileSync(new URL(`../workflow/${name}.json`, import.meta.url)));
  return async function run(nodeName, data, refs = {}) {
    const node = workflow.nodes.find(n => n.name === nodeName);
    if (!node?.parameters?.jsCode) throw new Error(`Code node missing: ${nodeName}`);
    const items = (Array.isArray(data) ? data : [data]).map(json => ({json}));
    class FixtureDate extends Date {
      constructor(...args) { super(...(args.length ? args : ['2026-01-01T12:00:00.000Z'])); }
      static now() { return new Date('2026-01-01T12:00:00.000Z').getTime(); }
    }
    const context = vm.createContext({
      $json: items[0]?.json,
      $input: {all: () => items, first: () => items[0]},
      $: name => {
        if (!(name in refs)) throw new Error(`Reference missing: ${name}`);
        const r = (Array.isArray(refs[name]) ? refs[name] : [refs[name]]).map(json => ({json}));
        return {all: () => r, first: () => r[0], item: r[0]};
      },
      Date: FixtureDate, console
    });
    const result = await new vm.Script(`(async () => {${node.parameters.jsCode}\n})()`)
      .runInContext(context, {timeout: 5000});
    return JSON.parse(JSON.stringify(result));
  };
}
export const readExample = name => JSON.parse(fs.readFileSync(new URL(`../examples/${name}.json`, import.meta.url)));
export function verifyExample(name, actual) {
  const url = new URL(`../examples/${name}.json`, import.meta.url);
  if (process.argv.includes('--write-examples')) fs.writeFileSync(url, JSON.stringify(actual, null, 2) + '\n');
  else if (JSON.stringify(JSON.parse(fs.readFileSync(url))) !== JSON.stringify(actual)) throw new Error(`Example drift: ${name}`);
}
