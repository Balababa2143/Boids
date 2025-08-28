export const Scale = (min: number, max: number, factor: number) =>
    min + factor * (max - min)

export const Logistic = (mid: number = 0, rate: number = 1) =>
    (x: number) => 1/(1+Math.exp(-rate*(x-mid)))