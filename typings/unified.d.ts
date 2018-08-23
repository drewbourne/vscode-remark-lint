declare module 'unified' {
  export interface Processor {
    use(plugin: Plugin, options?: any): Processor;
  }

  export interface Plugin {}

  export interface Unified {
    (): Processor;
  }

  const unified: Unified;
  export default unified;
}
