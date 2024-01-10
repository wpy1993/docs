## ts相关

### Array
array有两种表现形式  `Array<any>` `any[]`

### 泛型 <T>
为`函数、接口、类`而生

```typescript
// 先说好，这个函数，我要用几个未知的玩意儿，都放在<>中，比如T、D等，然后函数中就可以用了
function sthToArray<T>(length, x: T): T[] {
  let arr: Array<T> = [];
  for (let i = 0; i < length; i++) {
    arr.push(x);
  }

  return arr;
}
```

```typescript
interface Int<T> {
  [key: string]: T;
}

let obj: Int<number> = { // 使用Int时，要开始定义一下T了
  age: 22,
};
```