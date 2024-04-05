export {};
declare global {
  namespace jest {
    interface Expect<R> {
      toBeAround(actual: number, expected: number, precision?: number): R;
    }
  }
}
