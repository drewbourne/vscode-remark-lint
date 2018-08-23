declare module 'remark' {
  import { Processor } from 'unified';
  export interface Remark {
    (): Processor;
  }
  const remark: Remark;
  export default remark;
}
