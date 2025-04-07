export type KeysUppercase<T> = {
  [k in keyof T]: k extends string ? Uppercase<k> : never;
}[keyof T];