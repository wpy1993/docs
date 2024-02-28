## concurrent mode 并发模式

> 该模式可帮助应用保持响应，并根据用户的设备性能和网速适当调整。react 17 仅实验版本可用，react 18 已默认支持（但是有局限性）  
> 主要包含两个场景： 1. js执行阻塞浏览器渲染 2. 网络请求阻塞界面渲染  
> `js执行阻塞` 通过`fiber架构及配套逻辑`实现 **可中断渲染** 来解决. `网络请求阻塞` 可通过 `suspense方案` 解决

### 可中断渲染
方案就是 `时间分片`，利用浏览器的许安然空闲时间执行diff工作。直到diff完成，再执行一次性的commit

### 时间分片
肉眼能接受的流畅画面最低帧率是60fps，所以一帧就是16ms。所以如果每个任务最多只能执行16ms、超过了就要停止，让浏览器先执行渲染，空余后再次启动后续任务

要求react 有 `暂定和重启diff操作` 的能力

#### 断点重启
react 16及之前的版本很难实现，因为**虚拟dom树天然是嵌套结构，diff是递归操作**，因为官方将之前的调度器称之为 `栈调度器`

所以`Fiber架构`应运而生，不再是 虚拟dom树，
它是一个**链表结构** —— 链表结构有利于暂停和重启。

#### fiber架构
diff的工作是遍历虚拟dom树。所以 react 设计了 **fiber tree**，每个fiberNode都有三个属性 `return` `sibling` `child`

1. 自上而下的遍历，先child，然后sibling —— 深度优先遍历
2. 遍历中，不断的把 节点访问、生成内容

#### diff过程
先复制一个 fiber tree， 里面 一个 React Element的工作就由它对应的 `fiber节点` 来负责
一个React Element 可以对应不止一个Fiber，Fiber在update的时候。从原来的Fiber（称之为current） 上clone一个新的Fiber（称之为alternate），两个Fiber diff出来的变化（side effect） 记录在alternate这个fiber上。更新结束后，alternate会取代之前的current

时间分片调度 基于requestIdleCallback实现，但是React有自己的一套调度逻辑，称之为Schedule

Fiber更新任务分为两个阶段， `Reconciliation Phase` 和 `Commit Phase`, 前者是一个计算阶段（diff），**计算结果可以背报错，计算过程可以被打断**，后者是一次性提交所有更新并渲染

> 因为被打断，就要局部重新开始，所以有些 WillXXX 生命周期钩子可能会被执行多次

### Suspense
应用示例

```js
import React, {Suspense} from 'react'
const AsyncComp = React.lazy(() => import('./comp'))

export default () => {
  <Suspense fallback={<div>Loading...</div>}>
    <AsyncComp>
  </Suspense>
}
```

Suspense 类似 ErrorBoundary。 `Comp`代码中需要 throw 一个promise，让Suspense处于`挂起`状态

#### React.lazy
核心原理也是 throw 一个 异步加载组件的 promise，加载好后 return 这个组件



------------------------------

### 依旧是聊时间分片
节点遍历时，使用时间分片，过程分解：
1. 分片开启
2. 分片中断、分片重启
3. 延迟执行

分片开启
1. 将时间分片 要调度的函数 抽象为一个任务对象
2. 设定分片工作时长，工作时长一般为5ms，具体由 Scheduler 根据任务优先级调整


performance.now() vs Date.now()
performance.now() 返回在当前页面的停留时间;精度为微秒级；不受系统时间修改的影响

performance.now() --> 7959.39999999851   - 就是小数点是微秒吧
Date.now() --> 1709112846354

分片中断和重启
一个变量保存一下current
然后每次遍历一个节点，就判断时间够不够用
分片任务是一个队列 - taskQueue，执行一个pop一个。有任务，就发起下一轮的时间分片

> 算是一个面试题： 异步执行 - 把主线程控制权交还给浏览器，能不能用微任务，为什么？
**不能用微任务，微任务无法真正达到交还主线程控制权的要求**
如果产生了微任务，会优先于 宏任务执行，而能够打断的操作，比如来自于游览器的点击事件，都是宏任务

选型
setTimeout -> 嵌套过深时，1ms失效，会变成4ms
requestAnimationFrame -> 微任务执行完，浏览器重排重绘 之前 执行
requestIdleCallback -> 微任务执行完，浏览器重排重绘 之后 执行
MessageChannle -> 执行时机比setTimeout靠前
所以异步执行优先使用 setImmediate, 其次 MessageChannel, 最后 setTimeout


-----------------


React 启动 concurrent mode 的方式

react 17

```js
ReactDOM.render // sync mode
ReactDom.create(document.getElementById('root')).render() // concurrent mode
```

react 18中
即使如同17一样开启了concurrent mode，也会和sync mode 一样，不可被打断 （因为18内部多了很多判断条件）
任务必须包裹一层 startTransition，才能被打断

```js
React.startTransition(() => {setState(xxx)})
```

### refer
[1](https://juejin.cn/post/7090536568368136206)
[2](https://juejin.cn/post/7169003415417618440)
[3](https://juejin.cn/post/7095719807055560735)
