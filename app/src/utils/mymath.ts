export const range = (n: number) => [...Array(n).keys()];

export const last = <T>(arr: T[]) => arr.at(-1) as T;
