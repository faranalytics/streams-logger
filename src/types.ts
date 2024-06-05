export type KeysUppercase<T> = {
    [k in keyof T]: k extends string ? Uppercase<k> : never;
}[keyof T]

export type KeysLowercase<T> = {
    [k in keyof T]: k extends string ? Lowercase<k> : never;
}[keyof T]

export type Values<T> = {
    [k in keyof T]: T[k]
}[keyof T]