declare module 'unified-engine' {
  import { VFile } from 'vfile';
  import { Processor, Plugin } from 'unified';

  export interface Reporter {
    (results: any): void;
  }

  export interface Options {
    processor: Processor;
    cwd?: string;
    files?: Array<string | VFile<any>>;
    extensions?: string[];
    rcName?: string;
    ignoreName?: string;
    pluginPrefix?: string;
    plugins?: Array<Plugin | [Plugin, { [key: string]: any }]>;
    presetPrefix?: string;
    packageField?: string;
    settings?: { [key: string]: any };
    reporter?: Reporter;
    reporterOptions?: { [key: string]: any };
    color?: boolean;
    silent?: boolean;
    quiet?: boolean;
    frail?: boolean;
  }

  export interface Engine {
    (
      options: Options,
      callback: (err: Error | null, code?: any, context?: any) => void
    ): void;
  }

  const engine: Engine;
  export default engine;
}
