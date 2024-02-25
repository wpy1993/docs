## promise & async/await

### promise

#### 示例一
```js
const p1 = new Promise((resolve, reject) => {
  console.log(1)
  resolve(3)
  console.log(2)  // 这句话依旧是可执行的
})
const p2 = p1.catch(e => 4)
console.log(p2) // Promise {<pending>}
```

1. `resolve()/reject()` 并不会导致后续的代码不执行
2. 关于p2， 因为上述代码没有失败，所以`.catch`没生效，所以可以认为 `p1 = p2`
3. `p1`整体是同步执行的，但是它的`.then`，是要扔到微队列中的，所以再快，也得等等


#### 示例二

```js
Promise.resolve(1).then(2).then(Promise.resolve(3)).then(console.log)
```

1. `then(2)` `then(Promise.resolve(3))` 里面不是函数，那么它相当于一句无效代码，返回的Promise也是跟着上一个有效的走。
2. 所以精简一下就是 `Promise.resolve(1).then(console.log)`, 末尾就是 console.log(1) --> 打印1


#### 示例三
```js
const pro1 = new Promise((resolve, reject) => {
  resolve(1);
});

pro1
  .then((data) => {
    console.log(data);
    return 3;
  })
  .then((data) => {
    console.log(data);
    return 4;
  })

pro1
  .then((data) => {
    console.log(data);
    return 11;
  })
  .then((data) => {
    console.log(data);
    return 12;
  })
```

> 答案 1 1 3 11   
> 如果不断的.then, 两个也是交替的。想要表达的是，微任务队列，可以认为`只有一个`，**不会**出现 `微任务产生的微任务，会存在于 子微任务队列 中` 这件事❌


### async

#### 示例一

```javascript
async fn() {
  await 1
}
```

如上，await 1 等价于 `await Promise.resolve(1)`，也就是说，await后面跟着 一个同步函数/值，依旧认为它是**异步内容**，要扔到`微队列`中去执行


#### 示例二

```js
// 注意不要使用let or const, 否则因为 ·声明不上升·，第一次打印 TTT 就直接报错
var TTT = new Promise(async (resolve, reject) => {
  console.log(TTT) // undefined
  await 1
  console.log(TTT)  // Promise {<pending>}
  await TTT  // 某种意义的死循环，后面两个不再执行
  resolve(true)
  console.log('end')
})

setTimeout(() => {
  console.log('1')
  // promise也不会因为上面的假死状态而不再可用
  console.log(Promise.resolve('finish'))
}, 1000)
```

两个知识点
1. 关于TTT三步走，**先创建变量，再执行完毕右侧，再来赋值** —— 所以第一个TTT还未被赋值
2. await 1代表着执行完毕了，跳出宏任务，这时候TTT被赋值了，所以第二个TTT，属于`微任务的打印`，自然有值了
3. await 自己，自己还没触发到resolve/reject，所以就**死循环/假死**了，又因为Promise并不在主线程挂起，所以`并不会主线程卡死`


#### 示例三

```js
async function boo() {
  console.log(456)
}

async function foo() {
  console.log(123)
  await boo()
}

async function fn() {
  await foo()
  console.log('end')
}

fn()
console.log('start')
setTimeout(() => {console.log('final')})
```

这里想要表达一下，
1. 答案是先 **123**, **456**, 然后才是 **start**, **end**, 最后 **final**
2. `foo()` `boo()` 本身不会进入微队列，会被直接执行，**await的下一行代码**才会进入微队列, 所以 **123**  **456** 会一次性执行完


#### 示例四

```js
async function foo() {
  console.log(123);
  await 1;
  console.log("foo 1");
  await 2;
  console.log("foo 2");
}

async function fn() {
  await foo();
  console.log("end");
}

fn();
```

答案是 123、 foo 1、 foo 2、 end

也就是说， 第一次，有两个微队列， **await 1后面** 和 **console end**，但是执行微队列 **await 1** 的时候，会不停地优先执行衍生的微队列 **await 2**, 然后才回到 **console end** 这个父级微队列



## 附： 判断Promise
```js

function isPromise(obj) {
  return !!(obj && typeof obj === 'object' && typeof obj.then === 'function')
}
```
> 为什么这么简单？为什么不用 `instanceof Promise`这样直接判断？  
> 因为，我们认为，只要符合Promise A+规范，即使不是官方的Promise，也是被认可的Promise  
> 所以判断的关注点应该在是否为对象以及then是否合理