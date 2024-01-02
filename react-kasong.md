## 阅读 React 技术揭秘（卡颂）笔记

> React理念 - 快速响应

- 在浏览器的每一帧对应的时间中，都预留一些时间给js线程 —— react利用这部分时间更新组件 （源码中，预留的初始时间是5ms - `let yieldInterval = 5`）
  - 帧率计算 - 频率，用 `fps(frame per second)`, 或者 `Hz(赫兹)`，他们极其类似。数据上很类似，所以从**前端角度**，可以认为它们一致。
  - 一般都是60Hz，那么就是 1000ms / 60Hz，也就是每16.6ms刷新一次视图。也就是说，每一帧对应的时间，基本都是16.6ms (120Hz刷新率则为8.3ms了)

- 两大瓶颈
  - CPU的瓶颈 - 解决方案：开启时间切片 （开启concurrent mode）
  - IO的瓶颈 - 解决方案：开始Concurrent mode的同时，使用 `Suspense功能` 以及配套的 `useDeferredValue (hook)`


- 开启Concurrent Mode 会启动时间切片

  ```js
  // 通过使用ReactDOM.unstable_createRoot开启Concurrent Mode
  // ReactDOM.render(<App/>, rootEl);  
  ReactDOM.unstable_createRoot(rootEl).render(<App/>);
  ```


### React 15 架构
- Reconciler 协调器 —— 负责找出变化的组件，处理完毕虚拟dom
- Renderer 渲染器 —— 虚拟dom渲染页面上 - 因为不同的平台，需要不同的渲染器，比如reactDom、reactNative

- 缺点
> 递归更新，且更新一部分，就会渲染一部分。如果遇到了中断，那么页面会出现一半新数据，一半老数据的问题；所以react 16重写了

### React 16 架构
- Scheduler 调度器 —— 控制优先级序列，高优先级任务先进入Reconciler
- Reconciler
- Renderer

- Scheduler
  - Scheduler 是 requestIdleCallback 的polyfill; 关于requestIdleCallback，有浏览器兼容问题，触发频率不稳定，比如浏览器tab切为后台后，频率会降低
  - Scheduler 是独立于react的库
- Reconciler 和
  - 递归处理虚拟dom，但是增加了打断，shouldYield()
  - 所有组件都完成了Reconciler工作后，同一交给Renderer

### fiber 心智模型
- 践行 代数效应 (Algebraic Effects) —— `函数式编程` 中的一个概念，用来将 副作用 从 函数调用 中分离
- React 虚拟DOM，就叫Fiber
- 三层含义: 被称为 Fiber Reconciler ; 作为静态数据，每个Fiber节点对应一个 React element ; 作为动态工作单元，Fiber保存了更新中的状态、要执行的工作
- 作为树形结构，fiber有三个指向，return | child | sibling
- 使用了 `双缓存` 技术，也就是通过 alternate 属性字段，连接着旧的fibers —— current fiber 和 workInProgress fiber
  - 通过根节点，将current 指向不同的fiber，完成 fiber树 的替换
  - 只有一个fiberRootNode，可能有多个rootFiber(多次调用ReactDOM.render函数)
- update时，workInProgress fiber的创建，可以复用 currentFiber对应的节点数据 —— 是否服用的过程就是 `Diff算法`


### jsx相关
- react 17之前，需要显式的声明 `import React from 'react'`, 因为编译时期babel会把jsx内容，改成`React.createElement`调用
- react 17开始，不再需要显示声明了，因为变成了 使用 `jsx-runtime`中的 `jsx()` 来调用了;也就是新增且默认引入了`react/jsx-runtime`
- jsx和Fiber节点
  - jsx 不包含 schedule、 reconcile、 render 所需的信息
  - 所以mount阶段，Reconciler 根据 jsx 描述的组件内容，生成对应的Fiber节点
  - update阶段，Reconciler 将 fiber对比，生成新fiber、并根据俄对比结果为 Fiber节点 打上标记


### render阶段
#### 流程概览
- render阶段流程 开始于 performSyncWorkOnRoot or performConcurrentWorkOnRoot ，取决于同步更新还是异步更新
  - performSyncWorkOnRoot 调用 workLoopSync; performConcurrentWorkOnRoot 调用 workLoopConcurrent方法
  - 两个workLoop，区别就在于是否多了一个 shouldYield (Concurrent模式增加了 `!shouldYield()` )

- Fiber Reconciler 是从 Stack Reconciler 重构而来，实现可中断的递归
  - 递 —— 从 rootFiber 开始向下深度优先遍历，为每一个 Fiber阶段调用 `beginWork方法` - 遍历连接子Fiber
  - 归 —— 调用 `completeWork方法` ，进入兄弟Fiber的递，否则回归父Fiber；
  - 直到回到rootFiber，完成render阶段
  - 纯文本字符串，会被react特殊优化，不会触发递归流

#### beginWsork
- beginWork 方法，接收三个参数， workInProgress.alternate，也就是current Fiber； workInProgress, 也就是待完善的fiber; 然后是`renderLine`，优先级相关
  - current == null ? mount : update 可以用来判断所处阶段
  - 所以update阶段有个优化，如果存在可能优化的路径，那么就复用current
  - workInProgress.tag 不同，创建不同的子Fiber节点。tag有 IndeterminateComponent | lazyComponent | FunctionCompoment | ClassComponent | HostRoot | HostComponent .etc
  - 更新时，对比props是否相同、fiber.type是否相同，是的话，直接复用之前的子fiber
  - tag为常见组件类型，比如FunctionComp | ClassComp | HostComp 时，最终进入`reconcilerChildren方法`

- `reconcilerChildren()` 是Reconciler 核心方法
  - 对于 mount 的组件，创建新的 子Fiber  —— `mountChildFibers()`
  - 对于 update 的组件，**diff算法**，将比较的结果生成 带有effectTag的新的fiber  —— `reconcileChildFibers()`

- 要执行的DOM的操作具体类型，保存在 `Fiber.effectTag` 中
  - Placement | Update | PlacementAndUpdate | Deletion

- 如果fiber节点插入到dom中，需要满足下面两个条件
  - 存在 fiber.stateNode —— fiber节点保存的对应的`DOM节点`
  - (fiber.effect & Placement) !== 0，即fiber中存在Placement和effectTag

- mount 时，只有rootFiber 会赋值 `Placement effectTag`

#### completeWork
- 依旧是 fiber.tag字段，做switch判断然后分别处理； 下面重点关注 HostComponent 这个类型
  - `HostComponent`，指的是 原生DOM组件 对应的Fiber节点
  - 判断 `current != null && workInProgress.stateNode != null` ? update : mount
  - stateNode != null ，说明该Fiber节点 存在对应的 DOM节点
- update阶段，主要调用 `updateHostComponent()` 方法。因为DOM节点已经存在了，所以需要做的主要是处理各种props包括children props
- mount阶段，为Fiber创建对应的DOM节点； 将子孙DOM节点插入刚生成的DOM节点中； 与update类似的处理props
- effectList 一个单向链表，在 归 阶段，把所有有 effectTag的 fiber 都追加到effectList中


### commit阶段

> 从 `commitRoot` 开始，参数为 fiberRootNode

- rootFiber.firstEffect 上保存了一条需要执行 副作用 的 关于 fiber节点 的单向链表`EffectList`， 里面的 Fiber节点的 updateQueue 中保存了变化的prpos
  - 副作用 对应的 DOM 操作在 commit 阶段执行
  - 一些生命周期钩子，也在commit阶段执行
  
- commit阶段主要工作
  1. before mutation 执行 dom操作 前
  2. mutation 执行中
  3. layout 执行后
  - before mutation 和 layout 阶段，还有额外的工作，比如 useEffect的触发、 优先级相关 的重置、 ref的绑定/解绑

#### before mutation
- 遍历effectList 并且调用 commitBeforeMutationEffects 处理




- [react源码文件结构](https://react.iamkasong.com/preparation/file.html#packages%E7%9B%AE%E5%BD%95)


