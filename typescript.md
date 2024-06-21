## ts相关

### typescript的本质

> Typescript - JavaScript的超集

但是由于我们开发中也基本都在使用js的新语法，所以实际用起来，ts最大的特点，就是多了许多静态类型检查。也就是`类型定义` —— 在每一次的变量声明（const/let/var、function foo、function foo(这里的参数) )都要`定义类型`



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



一些数据类型

1. setTimeout如何定义

js版本案例

`let timer= null; timer = setTimeout(() =>{}, 1000)` 

ts失败改造

`let timer: typeof setTimeout = null;  // later...  timer = setTimeout(() => {}, 1000)` 失败，既然是timeout类型了，初始不能为null

解决方案：

```typescript
let timer: ReturnType<typeof setTimeout>

timer = setTimeout(() => {}, 1000)
```

- 初始不要给timer 赋值`null/undefined`了，就为空放在那里

- timer 类型为 `ReturnType<typeof setTimeout>`



2.  AbortController

   `let controller: AbortController = new AbortController()`

## 一些高级类型

ReturnType 预定义的有条件类型（在lib.d.ts中）

typeof 类型保护

Record

Partial