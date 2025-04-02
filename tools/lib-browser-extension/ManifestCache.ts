import { Worker } from 'node:worker_threads';
import { JSONMerge } from '../../src/lib/ericchase/Algorithm/JSON/Merge.js';
import { BuilderInternal, ProjectFile } from '../lib/Builder.js';

export let MANIFEST_REQUIRED: Record<string, any> = {};
export let MANIFEST_OPTIONAL: Record<string, any> = {};
export let PER_BROWSER_MANIFEST_OPTIONAL: Record<string, any> = {};
export let PER_BROWSER_MANIFEST_PACKAGE: Record<string, any> = {};

export async function updateManifest(builder: BuilderInternal, manifest_file: ProjectFile) {
  const worker_script = `
import { isMainThread, parentPort } from 'node:worker_threads';

${await manifest_file.getText()}

if (isMainThread) throw new Error('Worker only');

parentPort?.postMessage({
  data: {
    MANIFEST_OPTIONAL: typeof MANIFEST_OPTIONAL !== 'undefined' ? MANIFEST_OPTIONAL : {},
    MANIFEST_REQUIRED: typeof MANIFEST_REQUIRED !== 'undefined' ? MANIFEST_REQUIRED : {},
    PER_BROWSER_MANIFEST_OPTIONAL: typeof PER_BROWSER_MANIFEST_OPTIONAL !== 'undefined' ? PER_BROWSER_MANIFEST_OPTIONAL : {},
    PER_BROWSER_MANIFEST_PACKAGE: typeof PER_BROWSER_MANIFEST_PACKAGE !== 'undefined' ? PER_BROWSER_MANIFEST_PACKAGE : {},
  },
});
    `;

  const module: any = await new Promise((resolve, reject) => {
    const worker = new Worker(worker_script, { eval: true });
    worker.on('message', (msg) => {
      if (msg.error) {
        reject(msg.error);
      } else {
        resolve(msg.data);
      }
    });
    worker.on('error', reject);
    worker.on('exit', (code) => {
      code ? reject(code) : null;
    });
  });

  MANIFEST_REQUIRED = module.MANIFEST_REQUIRED ?? {};
  MANIFEST_OPTIONAL = module.MANIFEST_OPTIONAL ?? {};
  PER_BROWSER_MANIFEST_OPTIONAL = module.PER_BROWSER_MANIFEST_OPTIONAL ?? {};
  PER_BROWSER_MANIFEST_PACKAGE = module.PER_BROWSER_MANIFEST_PACKAGE ?? {};
}

export function getManifestBrowsers() {
  return new Set(Object.keys(PER_BROWSER_MANIFEST_OPTIONAL)).union(new Set(Object.keys(PER_BROWSER_MANIFEST_PACKAGE)));
}

export function getPerBrowserManifest(name: string) {
  return JSONMerge(
    MANIFEST_REQUIRED,
    MANIFEST_OPTIONAL,
    PER_BROWSER_MANIFEST_OPTIONAL[name] ?? {},
    //
  );
}

export function getPerBrowserPackageManifest(name: string) {
  return JSONMerge(
    MANIFEST_REQUIRED,
    MANIFEST_OPTIONAL,
    PER_BROWSER_MANIFEST_OPTIONAL[name] ?? {},
    PER_BROWSER_MANIFEST_PACKAGE[name] ?? {},
    //
  );
}
