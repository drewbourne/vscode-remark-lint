declare module 'pretty-hrtime' {
  export interface PrettyHrtime {
    (value: [number, number]): string;
  }

  const hrtime: PrettyHrtime;
  export default hrtime;
}
