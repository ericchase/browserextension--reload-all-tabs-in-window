import { Path } from '../src/lib/ericchase/Platform/FilePath.js';
import { Builder } from './lib/Builder.js';
import { Processor_BasicWriter } from './lib/processors/FS-BasicWriter.js';
import { Processor_HTML_CustomComponent } from './lib/processors/HTML-CustomComponent.js';
import { Processor_HTML_ImportConverter } from './lib/processors/HTML-ImportConverter.js';
import { Processor_TypeScript_GenericBundlerImportRemapper } from './lib/processors/TypeScript-GenericBundler-ImportRemapper.js';
import { module_script, Processor_TypeScript_GenericBundler, ts_tsx_js_jsx } from './lib/processors/TypeScript-GenericBundler.js';
import { Processor_TypeScript_GenericCompiler } from './lib/processors/TypeScript-GenericCompiler.js';
import { Step_Bun_Run } from './lib/steps/Bun-Run.js';
import { Step_CleanDirectory } from './lib/steps/FS-CleanDirectory.js';
import { Step_Format } from './lib/steps/FS-Format.js';
import { Processor_UpdateManifestCache } from './Process-UpdateManifestCache.js';
import { Step_BrowserExtension_Bundle } from './Step-BrowserExtension-Bundle.js';

// Use command line arguments to set watch mode.
const builder = new Builder(Bun.argv[2] === '--watch' ? 'watch' : 'build');

// These steps are run during the startup phase only.
builder.setStartUpSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'] }, 'quiet'),
  Step_CleanDirectory(builder.dir.out),
  Step_Format('quiet'),
  //
);

// These steps are run before each processing phase.
builder.setBeforeProcessingSteps();

// Basic setup for a typescript powered extension. Typescript files that match
// "*.module.ts" and "*.script.ts" are bundled and written to the out folder.
// The other typescript files do not produce bundles. Module ("*.module.ts")
// files will not bundle other module files. Instead, they'll import whatever
// exports are needed from other module files. Script ("*.script.ts") files, on
// the other hand, produce fully contained bundles. They do not import anything
// from anywhere. Use them accordingly.

// HTML custom components are a lightweight alternative to web components made
// possible by the processors below.

// The processors are run for every file that added them during every
// processing phase.
builder.setProcessorModules(
  Processor_HTML_CustomComponent(),
  Processor_HTML_ImportConverter(),
  Processor_TypeScript_GenericBundler({ sourcemap: 'none', target: 'browser' }),
  Processor_TypeScript_GenericBundlerImportRemapper(),
  // all files except for .ts and lib files
  Processor_BasicWriter(['**/*'], [`**/*${ts_tsx_js_jsx}`, `${builder.dir.lib.standard}/**/*`, '**/*{.bat,.svg}']),
  // all module and script files
  Processor_BasicWriter([`**/*${module_script}${ts_tsx_js_jsx}`], []),
  // compile the manifest file; no need to write it out
  Processor_TypeScript_GenericCompiler([Path(builder.dir.src, 'manifest.ts')], [], { target: 'browser' }),
  Processor_UpdateManifestCache(Path(builder.dir.src, 'manifest.ts')),
  //
);

// These steps are run after each processing phase.
builder.setAfterProcessingSteps(
  Step_BrowserExtension_Bundle('release'),
  //
);

// These steps are run during the shutdown phase only.
builder.setCleanUpSteps();

await builder.start();
