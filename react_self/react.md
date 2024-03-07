## React 再再再笔记

react两大阶段
- render阶段 - 在内存中进行，可被反复中断
  - Scheduler 调度器组件
  - Reconciler 协调器组件
- commit阶段
  - Renderer 渲染组件

`Scheduler调度器`： 调度任务，安排优先级，高优先级先进入Reconciler
`Reconciler协调器`： 生成Fiber、收集副作用（增删改），找出哪些节点发生了变化，打上不同的flags。 diff算法也在这个组件中执行
`Renderer渲染器`： 根据协调器计算出来的虚拟DOM同步渲染节点到视图上






在 react-dom 中
scheduleUpdateOnFiber里面有一个 addFiberToLaneMap(root, fiber, lane),做了什么，
  root内有一个 pendingUpdaterLaneMap - 是个数组，里面最多有个31个Set，把更新的fiber存进去
  然后就是 ensureRootIsScheduled()
    这个函数中，默认调用了 `scheduleSyncCallback`，并非调用 `legacySync` 模式 - 这个函数看起来，就是给 `维护的一个syncQueue`数组pushcallback
      - 猜测一下，是不是有多个hook的setXXX，就会存多个？
    再内部的callback是 `performSyncWorkOnRoot` ,看起来，这个就是那个while(true)
    然后执行 `scheduleMicrotask( flushSyncCallbacks )`

所以scheduleUpdateOnFiber执行完毕，代表着 我的 onClick 事件完毕


executeDispatch 是？

batchedUpdates 是 ？

然后进入到 clearIfContinuousEvent
然后回归到 scheduleMicroTask的callback 中
此时才执行 performSyncWorkOnRoot，里面有 flushPassiveEffects()

然后 renderRootSync， 里面 movePendingFibertoMemoized（）
rootWorkInProgress = createWorkInProgress(root.current, null)

finishQueueingConcurrentUpdates

依旧是renderRootSync，里面 终于要 do workLoopSync() 了，再里面就是 performUnitOfWork ，对着 workInProgress操作