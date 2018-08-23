declare module 'retext' {
  import { Processor } from 'unified';
  export interface Retext {
    (): Processor;
  }
  const retext: Retext;
  export default retext;
}
