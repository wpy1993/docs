function sthToArray<T>(length, x: T): T[] {
  let arr: Array<T> = [];
  for (let i = 0; i < length; i++) {
    arr.push(x);
  }

  return arr;
}

interface Int<T> {
  [key: string]: T;
}

let obj: Int<string> = {
  name: "wplay",
};
