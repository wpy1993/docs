## react源码一些面试题

current - 当前的Fiber树，前缓冲区；
workInProgress - 缩写为 wip， 下次渲染的Fiber树， 后缓冲区


> completeWork 工作流程
completeWork属于 `递与归` 中的 `归`。 它也会根据 wip.tag 区分对待，流程上主要包括两个步骤
- 创建元素或者标记元素的更新
- flags冒泡  （flag属性，指明出 副作用为 增、删 or 改）

**mount阶段**
以hostComponent为例 （HostComponent - 原生组件比如 div）
1. createIntance - 创建DOM元素
2. appendAllChildren - 对children执行appendChild - 又是深度优先的遍历
3. finalizeInitialChildren - 设置DOM元素属性，主要包含 styles、innerHTML等属性
4. bubbleProperties - flag冒泡， 也就是在 自下而上的过程中，顺手收集 `副作用`， 每个节点都有subTreeFlags,记录着它和子有没有副作用

一个说明： 早期时，是通过`effect list` 链表收集的。现在改成了 `subTreeFlags`. 好处是什么，链表只能跳着去未知位置的某个fiber。而flags可以知道每一个Fiber中，它和子当前有没有副作用

**update阶段**
仅仅是完成属性更新的标记而已
比如updateHostComponent 主要逻辑在 diffProperties 方法里面，包含两次遍历
loop 1 - 标记删除的属性
loop 2 - 标记更新的属性
放在 FiberNode.updateQueue 里面， 形式为 [key, value, key, value], 比如 ['title', 'A', name, 'wplay']


> React的diff算法及流程； 为什么不采用 Vue 的双端对比算法（vue称该流程为patch）
发生在Render阶段。指的是 current FiberNode 和 JSX对象 之间的diff，生成新的wip FiberNode
diff算法本身复杂，react做了定制化的diff，也就是设置了`3个限制`:
1. 只 同级元素diff
2. 不同类型的元素，直接销毁
3. 可以通过key暗示哪些子元素能够保持稳定


双端对比算法
两个链表，各有一对两端双指针

react为啥不用，因为现在的FiberNode节点，没有反向指针。所以先diff试试，未来不行了，再换成双端指针


> commit阶段工作流程
分为三个阶段
（如果有副作用，就回有阶段1和2）
1. beforeMutation
2. Mutation
(Fiber Tree 切换 简单一句 root.current = finishedWork)
3. layout

每个阶段，又有三个子阶段
commitXXXEffects  - eg: commitBeforeMutationEffects
commitXXXEffects_begin
commitXXXEffects_complete

#### 先说三个子阶段
**commitXXXEffects**
该函数，把 firstChild 赋值给全局变量 nextEffect ，然后执行 commitXXXEffects_begin

**commitXXXEffects_begin**
向下遍历fiberNode，也就是说 `DFS深度优先 - 怼着tree的一条线，啥都不做，一直往底部冲`, 直到下面两个情况之一
1. 当前的fiberNode的子fiberNode的flags 为空
2. 不存在 子fiberNode
`到底后，执行 commitXXXEffects_complete`

**commitXXXEffects_complete**
1. 对flags执行对应的操作，也就是  `commitXXXEffectsOnFiber()`， 也就是三个总阶段所在的真正位置
2. 存在兄弟，则进入兄弟 begin
3. 没有兄弟，则对父执行 complete

#### 回归到三个父阶段
**beforeMutation**
对于ClassComponent: 执行 getSnapshotBeforeUpdate
对于 HostRoot: 清空原生元素 挂载的内容，方便Mutation阶段进行渲染

**Mutation**
对于HostComponent, 主要工作就是对DOM元素进行增、删、改

为什么插入和改(移动) 会是同一个方法
因为insertBefore 和 appendChild 这两个js原生方法，对于 全新的 会正常操作，对于 已有的 会成为移动操作


**layout 阶段**
在此阶段，主要工作集中在 commitLayoutEffectsOnFiber 方法中，针对不同类型的 FiberNode 执行不同的操作
- ClassComponent: 执行compoenntDidMount/Update 方法
- FunctionComponent: 执行 useLayoutEffect 函数
