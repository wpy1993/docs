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
- update时，workInProgress fiber的创建，可以复用 currentFiber对应的节点数据 —— 是否复用的过程就是 `Diff算法`

> ps: `rootFiber` 指的是 `div#root`，可以有多个（写多次ReactDOM.render嘛）  
> `fiberRoot` 是所有`rootFiber` 共用的唯一节点  
> `fiberRoot.current` 指向当前正在使用的`rootFiber`


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

- Fiber Reconciler 是从 Stack Reconciler 重构而来，实现可中断的递归 (performUnitOfWork)
  - 递 —— 从 rootFiber 开始向下深度优先遍历，为每一个 Fiber阶段调用 `beginWork方法` - 遍历连接子Fiber
  - 归 —— 调用 `completeWork方法` ，还是从顶层开始，递归然后进入兄弟Fiber的递，否则回归父Fiber；
  - 直到回到rootFiber，完成render阶段
  - 纯文本字符串，会被react特殊优化，不会触发递归流

#### beginWork
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
  - effectList 是保存了需要`执行副作用`的fiber节点，副作用比如 `Placement` `Update` `Deletion`
- commitBeforeMutationEffects 
  - 内部针对 里面的 nextEffect 进行判断，调用 `getSnapshotBeforeUpdate` - `commitBeforeMutationEffectOnfiber`; 然后调度 `useEffect` - `scheduleCallback -> flushPassiveEffects`
  - 总结为: 1. 处理DOM节点 渲染/删除 后的`autoFocus` `blur` 逻辑； 2. 调用`getSnapshotBeforeUpdate` 钩子； 3. 调度 `useEffect`
  - `commitBeforeMutationEffectOnFiber` 是 `commitBeforeMutationLifeCycles` 的别名，方法内调用`getSnapshotBeforeUpdate`
  - 触发`useEffect` 的方法是 `flushPassiveEffects`
- useEffect是被异步调度的，也就是在`scheduleCallback`的`callback`中被调用
  1. `before mutation阶段` 在 `scheduleCallback` 中调度 `flushPassiveEffects`
  2. `layout阶段` 后，将 `effectList` 赋值给 `rootWithPendingPassiveEffects`
  3. `scheduleCallback` 触发 `flushPassiveEffects`，其内部遍历这个 `effectList`
  - useEffect 异步执行的主要原因是 `防止同步执行时堵塞浏览器渲染`

#### mutation阶段
- 依旧是遍历 effectList，执行 `commitMutationEffects`
- 1. 根据 `ContentReset & effectTag` 重置文字节点； 2. 更新Ref; 3. 根据tag进行增删改查操作
  - 可能会触发 `commitResetTextContent` `commitDetachRef` `commitPlacement` `commitWork` `commitDeletion`
  - `Hydrating` 是服务端渲染相关
- 看一看`commitPlacement`
  - 获取`parentFiber`(getHostParentFiber); 获取`sibling`(getHostSibling); 根据父节点类型是否为rootFiber,决定调用`insertOrAppend`
  - `getHostSibling` 可能会很复杂，我不理解?
- effect涉及到 `update`， 则会调用`commitWork`
  - 如果`fiber.tag`为`FunctionComponent`,调用`commitHookEffectListUnmount`，遍历effect，执行内部的有关`useLayoutEffect hook` 的`effect.destory()`
  - 销毁函数，就是`useEffect(() => {  return () => {} })` `return的箭头函数`就是销毁函数
  - 如果`fiber.tag`为`HostComponent`, 调用`commitUpdate`,其内部做了两件事情 `updateFiberProps` `updateProperties`
- 如果effect 涉及到 `deletion`，调用`commitDeletion`
  - 1. 递归调用fiber节点以及后代，调用`componentWillUnmount` 2. 解绑ref 3. 调度useEffect的`destroy()`(也就是return的那个callback)


#### layout 阶段
> 该阶段，DOM已经修改完毕。js以及可以获取到新的DOM，但是浏览器页面还没有完成渲染；此时的生命周期和hooks可以访问改变后的DOM  
> 所以在我看来，所谓的访问DOM，都是虚拟的DOM，document.xxx此时还不准确

- 依旧遍历effectList,执行`commitLayoutEffects`函数
  - `commitLayoutEffectOnfiber` 调用 `生命周期钩子` 和 `hook的相关操作`
  - `commitAttachRef` 赋值ref

> 关于`commitLayoutEffects`
- 如果是class相关，包括 `ForwardRef` `React.memo包裹的Function`
  - 根据`fiber.alternate ==== null` 判断，是触发 `componentDidMount` or `componentDidUpdate`
  - this.setState的`callback` 此刻也会被调用
- 如果是Function
  - 调用 `useLayoutEffect` 的函数、 调度(安排但不触发)`useEffect` 的函数以及destroy
- useEffect 和 useLayoutEffect 的**区别**
  - `useLayoutEffect` 在 `mutation阶段` 的 `update effect` 就被销毁，`layout阶段` 再调用更新，它是同步执行的
  - `useEffect` 在 `layout阶段` 仅仅是调度，等到阶段完成后，再`异步执行`
- 如果ReactDOM.render(p1, p2, () => {}) 有第三个参数，此时也会被调用

> 关于 `commitAttachRef`
- 获取DOM实例，更新ref,详细的见源码吧
- `getPublicInstance(fiber.stateNode)` 获取一个数据实例; 然后如果是function, 则`ref(实例)`,否则，`ref.current = 实例`


> 切换一下fiber树, 代码为 `root.current = finishedWork`,这个行为在 `mutation阶段` 之后， `layout阶段` 之前，  
> 就是为了`layout阶段` 触发生命周期，内部读取fiber内容的时候，是读取的新的内容 （不必等浏览器渲染完毕）


### 相关实现
#### Diff算法
> 本身，diff算法，比较两棵树m和n，就是O(n^3)的复杂度，或者较真点，复杂度为 O(n^2 * m * (1 + logmn))， 如果m和n同阶  
> 那么就是 n^2 * n * 1 = n^3, O(n^3) 由此而来
> n^2 是因为肯定要有两个循环，遍历m， m的每一个都和 遍历n 比较一下
- react针对diff算法的优化策略 （感觉三条可以一句话说完啊）
  1. 仅同级比较（也就是坚持和自己的alternate比），绝不跨级
  2. 如果类型直接不同了，那么直接删除替代，不会考虑它是否仅仅位移而已
  3. 可以通过key控制哪些元素保持稳定 - 可被跳过
- Diff算法的入口函数是 `reconcileChildFibers`
  - 里面根据俄一系列判断，如果是Array，则进入 recondileChildrenArray 多节点diff; 否则，大多数场景下，进入 `renconcileSingleXXX` 单节点diff
  - 比如 newChild 类型为 object number string，代表同级仅有一个节点
- 单节点diff -> 比如`reconcileSingleElement`
  - 比较key、**key不同，直接无脑标记为删除**； key相同，根据tag，比较type
- 多节点diff -> `reconcileChildrenArray`
  - diff算法会经过两轮遍历
  - 第一轮： 处理 update 节点； 第二轮：处理 剩下的 非update节点
  - 第二轮中，把oldArray `map一下`，变成 key: index的对象, 遍历剩下的`newArray`，如果匹配到了`oldArray的key`，就判断是否需要移动，匹配不到就标记为删除

#### 状态更新
> 此逻辑在 `render阶段之前`, 也就是 `状态更新` -> `render阶段 (perform Sync/Concurrent WorkOnRoot)` -> `commit阶段 commitRoot`

触发更新的方式 (排除SSR)
- ReactDOM.render —— HostRoot
- setState        —— ClassComponent
- forceUpdate     —— ClassComponent
- useState        —— FunctionComponent
- useReducer      —— FunctionComponent
他们如何接入同一套`状态更新机制` —— 通过创建一个保存更新状态相关内容的对象`Update`，render阶段的`beginWork` 会根据 `Update Object` 计算

`Update` 在`触发状态更新的fiber` 上, 调用 `markUpdateLaneFromFiberToRoot` —— 从`触发状态更新的fiber`向上遍历（利用`returnFiber`），直到返回`rootFiber`
有`包含Update的rootFiber`了，通知`Scheduler`根据优先级，决定`同步还是异步`的方式 `调度` 本次更新 —— `ensureRootIsScheduled`
- 判断`newCallbackPriority === SyncLanePriority`与否，决定调用 `scheduleSyncCallback` or `scheduleCallback`
  - `scheduleSyncCallback` 的 cb 是 `performSyncWorkOnRoot`
  - `scheduleCallback` 的 cb 是 `performConcurrentWorkOnRoot`

#### 更新机制 的 心智模型
并发更新，相当于`git stash` ，然后更新完高优先级的后，再`git stash pop`继续执行
具体实现:
- 通过 `ReactDOM.createBlockingRoot` 和 `ReactDOM.createRoot` 创建的应用会采用 `并发模式` 更新状态
- 高优先级 会打断 低优先级，先一步完成`render - commit`
- 基于`高优先级的更新结果`，重新更新`低优先级`

#### Update
根据触发更新的方法，对组件进行分为三类: HostRoot | ClassComponent | FunctionComponent
根据组件的分类，有两种`Update结构`: `Class 和 Host` 一种， `Function` 单独一种
- `Update` 由 `createUpdate` 创建并返回，关键字段
  - tag： 包含 UpdateState 0 | ReplaceState | ForceUpdate | CaptureUpdate
  - payload, 如果是class，则为setState的第一个参数，对于HostRoot，为ReactDOM.render 的第一个参数
  - next 与其他Update连接形成链表
  - callback 更新的回调函数，也就是 `commit - layout子阶段` 中的cbs
  - 其他：eventTime performance.now() | lane 优先级 | suspenseConfig | priority dev模式下
- Fiber节点上挂在着 一到多个 Update `位于 fiber.updateQueue`
  - 如果多个，比如一次onClick中写了好几次 平行的 `this.setState`

- UpdateQueue 是 一个 list => Array<Queue>
  - `Queue对象`里面，关键字段有 baseState, shared.pending
  - shared.pending 放置着 需要被update的多个states，链表的形式存储，然后将其循环遍历，低优先级的被跳过，形成一条新的`memorizedState`，也就是上面的baseState


#### 优先级
- 生命周期 - 同步执行
- 受控用户输入 - 同步执行
- 交互事件（动画之类的） - 高优先级执行
- 其他（数据请求） - 低优先级执行

`Scheduler`中，通过`runWithPriority`进行优先级排列 —— 暂时给一个全局优先级赋值为当前优先级，运行当前代码，然后把全局优先级回撤
优先级最终反映在update.lane变量上
![优先级的作用示例](https://react.iamkasong.com/img/update-process.png) 图示-侵删

- 如果有一个低优先级的任务u1，被高优先级u2的插队了，他们形成了一条新updateQueue `u1 -> u2`, 那么先`跳过u1，执行u2`，commit之后，再回来执行`u1`，但是此时`链路依旧为 u1 -> u2`，所以u2的`componentWillXXX`会被执行`2次`，这就是旧的willXXX钩子会被标记为`unsafe_`
- 渲染的Fiber有两棵，一个是 `current`， 一个是 `workInProgress`。 它们同时绑定了`Update`，所以无论fiber如何从两棵树中切换，`需要更新的数据`都不会丢失
- 保证数据依赖之间连续性，比如 `A! - B2 - C1 - D2`，第一次执行完`A1 - C1`后，将 `A1`存储到`baseState`中，`B2 - C1 - D2` 重新执行
  - 可见省了`A1`的二次`ComponentWillXXX`, 同时`C1`前面有未执行的，所以`C1`不能被单独剔除


#### ReactDOM.render 全流程走一遍
- render() -> `fiberRootNode` & `rootFiber` -- `fiberRoot = legacyCreateRootFromDOMContainer()._internalRoot`
方法内部内部层层调用比如`createRootImpl -> createContainer`, 最终调用`createFiberRoot()`, 创建`fiberRootNode` & `rootFiber`, 将其关联。 初始化 `updateQueue`

- `fiberRoot._internal.current = rootFiber` & `rootFiber.stateNode = fiberRoot` 把`rootFiber` 和 `fiberRoot`关联起来

- 创建 `Update` - `updateContainer()` -> `createUpdate(); update.payload = jsx; update.callback = reactDOM.render的第三个参数`

- 所有总链路为
创建`fiberRootNode` `rootFiber` `updateQueue` --> 创建Update --> 从`fiber` 到 `root` (`markUpdateLaneFromFiberToRoot`) --> 调度更新`ensureRootIsScheduled` --> render阶段 `perform Sync|Concurrent WorkOnRoot` --> commit阶段`commitRoot`

- React 入口有三种模式
  - legacy  当前正在使用的模式                - `ReactDOM.render(jsx)`
  - blocking `concurrent`的过渡阶段          - `ReactDOM.createBlockingRoot(domEl).render(jsx)`
  - concurrent 包括`任务中断/任务优先级`       - `ReactDOM.createRoot(domEl).render(jsx)`
  - [三种模式的支持程度](https://react.iamkasong.com/state/reactdom.html#react%E7%9A%84%E5%85%B6%E4%BB%96%E5%85%A5%E5%8F%A3%E5%87%BD%E6%95%B0)
  - 从流程上，就是对`fiber.mode`变量产生影响，流程基本不变


#### this.setState 和 forceUpdate
`setState` 本质是调用了 `this.updater.enqueueSetState()` --> `createUpdate` - `enqueueUpdate` - `scheduleUpdateOnFiber`调度update
- `update.payload` = this.setState的第一个参数/对象

this.forceUpdate，和this.setState类似，区别
- 调用的是 `this.updater.enqueueForceUpdate()`,但是内部实现，比起`this.updater.enqueueSetState`， **lane = undefined** 且 **update.tag = ForceUpdate** 且 `update.payload = null`
- `ForceUpdate, 也就是 2` 有什么用？在判断`shouldUpdate`的时候，如果`tag = ForceUpdate`，则为true，也就是不会被 `shouldComponentUpdate` | `PureComponent` 影响，一定会更新 —— 数据不变，也要把`update相关钩子`都执行一遍

### Hooks
Hooks能最大限度的发挥 `Concurrent Mode`的潜力
- FunctionComponent对应的fiber -> `fiber = {memorizedState: hooks, stateNode: App}`
- `hooks`是一个 链表 ，单一的一个hook -> `hook = {queue: {pending: null}, memorizedState: initialState, next: null}`
- 每一个 `useState` 对应一个 `hook` 对象。调用`useState`时，第二个参数（eg setNum）产生的`update` 保存在对应的`hook.queue中`

- hook的触发，根据 fiber --> `current || current.memorizedState` 判断使用 哪个对象 --> `HooksDispatcherOnMount` or `HooksDispatchOnUpdate`

- `hook.memorizedState` 类似于 `fiber.updateQueue`;
  - `fiber.memorizedState` 是`FunctionComponent`对应`fiber`保存的`hooks`链表
  - `hook.memorizedState` 是`Hooks`链表中保存的 `单一hook` 对应的数据
    - `useState` `useReducer`， `memorizedState`中存储的是它的值`state`
    - `useEffect`存里面的函数
    - `useRef` 存储`{current: 1}`
    - `useMemo`存储着`[callback(), depA]`
    - 另外，`useContext`是没有`memorizedState`的

- `useState` `useReducer`是Redux的作者Dan带来的。`useState`本质上，只是**预置了reducer的useReducer**
- 他们的工作流程，可以分为`声明阶段`和`调用阶段`
- 声明阶段
  - 调用`renderWithHooks`方法， 方法内部，执行`FunctionComponent`对应函数(即`fiber.type`)
  - mount时， 调用 `mountReducer` or `mountState`
  - 它俩此时的区别，就在于`[hook.memorizedState, dispatch]` 中，dispatch有一个参数`lastRenderReducer`， useState中它是`basicStateReducer`, useReducer中它是普通的入参 `reducer`。 不过这两个reducer都是函数啊，不是变量
  - update时，都调用 `updateReducer` --> 找到 `hook`， 根据 `update` 计算该hook的 `新的state` 并返回
  - `didScheduleRenderPhaseUpdate` 这个变量，判断是否是 `render阶段` 触发的更新
- 调用阶段
  - 执行`dispatchAction`， 该FunctionComp 对应的`fiber` 以及 `hook.queue` 已经通过 bind方法 预先座位参数传入了
  - 流程概括为 创建`update`， 将 `update` 加入 `queue.pending` 中，并开启调度


#### useEffect
- 处于 `flushPassiveEffects` 方法中， 并执行 `flushPassiveEffectsImpl`, 后者主要做三件事情
  - 调用 `useEffect` 上一次render中的销毁函数 —— v16.13.1 后变成 `异步执行`
  - 调用 `useEffect` 这一次render中的回调(执行)函数  —— v16.13.1 后变成 `异步执行`
  - 如果存在 同步任务， 提前执行，不用等待 下次事件循环
- 上一次的被全部销毁`unmountEffects`后，再全部执行下一次的回调

#### useRef



- [react源码文件结构](https://react.iamkasong.com/preparation/file.html#packages%E7%9B%AE%E5%BD%95)
- [React算法之位运算](https://7km.top/algorithm/bitfield)
- [diff算法为什么是O(n^3)](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/151#issuecomment-510311760)

