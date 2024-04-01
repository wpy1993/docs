// 记录我debug react 源码的过程
## 一切从reactdom.createRoot开始;

var root = createContainer();
return createFiberRoot(); // 创建一个根fiber，也就是容器
root = new FiberRootNode(); // 见备忘录1
// root.current = createHostRootFiber;  createHostRootFiber.stateNode = root 让其相互绑定 // 见备忘录2
// 再给 host rootFiber 添加一个memoizedState = _initialState
initializeUpdateQueue(unitializedFiber); // 从此针对 rootFiber 搞事情， 给它添加上updateQueue，见 备忘录4
return root;

markContainerAsRoot(root.current, container); // 根fiber 的current指向容器 - 也就是div#root.internalContainerInstanceKey = host rootFiber
var rootContainerElement =
  container.nodeType === COMMENT_NODE ? container.parentNode : container; // 见备忘录5， 注释节点也会被react读取，然后剔除
listenToAllSupportedEvents(rootContainerElement); // 给div#root 的事件全部通过addEventListener的方式绑定上
return new ReactDOMRoot(root);  // this._internalRoot = root 也就是fiberRoot

总结：
createRoot 创建了一个 对象， {_internalRoot: root<FiberRoot>}, root.current = rootFiber<真正干事的fiber启动点>


## 接着进入 root.render() 方法吧
先读取到里面的jsx内容，然后解析一下
jsxWithValidation() -> jsxDEV(type)  第一次type.name === 'APP'
  return ReactElement()  // 创建一个 'element'，看起来像是dom的AST模式，见 备忘录6

这个解析，是自下而上的，比如 <App><Child/></App>, 先解析 Child， 然后再 App

接着render()
把this._internalRoot 提出来，还记得吗？ 也就是 root<FiberRoot>
updateContainer(children, root, null, null) // children 就是上面的jsx。  update才是真正的起点， return lane
  onScheduleRoot(container, element)  // container 是 root，element是 jsx
    有个全局的rootElements (在 react-refresh-runtime.js 中) 是一个 new WeakMap(), 存储一下 {container: element} 也就是 {root: jsx}
    current$1 = container.current //  这样，就把 代表host的RootFiber找出来了
    lane = requestUpdateLane(current$1)
    markRenderScheduled(lane)
    // 往下，我们称呼的fiber 都是 current$1 了
    var context = getContextForSubtree(parentComponent);
    update = createUpdate(eventTime, lane)  // 纯纯的创建了一个update对象，里面主要是lane信息
    update.payload.element = element
    root = enqueueUpdate(current$1, update, lane); // 组装一些东西，竟然最后返回的是 fiberRoot 这个容器
      return enqueueConcurrentClassUpdate(fiber: current$1, sharedQueue, update, lane)
        pushConcurrentUpdateQueue() // 全局存储一个 concurrentQueues = [queue], queue最初来自于fiber.updateQueue.shared
        queue.interleaved = update
        return markUpdateLaneFromFiberToRoot(fiber, lane)  // 见备忘录7
          return fiber.stateNode  // 最终竟然把 fiberRoot返回了
    // 接下来操作 root 和 current$1 了，也就是 容器 和 fiber, 最后return lane
    // TODO
    scheduleUpdateOnFiber(root, current$1, lane, eventTime);
      ensureRootIsScheduled(root, eventTime)
      最终得到了schedule中全局的 taskQueues [],最小堆的形式存储着所有的task
    // TODO
    entangleTransitions(root, current$1, lane);

聊聊 scheduleUpdateOnFiber(root, current$1, lane, eventTime)
  上来就是 checkForNestedUpdates(), 看了下代码，这个主要好像是防止 特别多的次数(max=51次)的update。 因为 nestedUpdateCount 只有commit函数中会被 ++;
  nestedPassiveUpdateCount 也是一样的，防止hooks溢出
  markRootUpdate(root, lane, eventTime) root是fiberRoot
    root.pendingLanes |= updateLane, 也就是给它添加上updateLane
  if (isDevToolsPresent) {
    addFiberToLaneMap(root, fiber, lane)
  }
  ensureRootIsScheduled(root, eventTime)
    getNextLanes(root, wipLanes)
    newCallbackNode = scheduleCallback$1(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root));
      return scheduleCallback(priorityLevel, callback)
        react.js 全局的 taskQueue[] push 一个 newTask (callback也放在了newTask.callback中了)。 但是这里的push，用到了最小堆 heap
        
    root.callbackPriority = newCallbackPriority;
    root.callbackNode = newCallbackNode;

接着来看 entangleTransitions(root, current$1, lane)
  好吧，初始化时没啥事
  //! 里程碑 reconcile finish


## 上述完毕后，进入perform中，怎么进入，通过 new MessageChannel().postMessage / onMessage 来实现 见备忘录11
performWorkUntilDeadline
  hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime)
    不知道为啥是进入了 flushWork()
    return workLoop()
      拿出来taskQueue中的最高优先级的一个，开始执行callback，还记得callback吗？就是 performConcurrentWorkOnRoot
      所以进入到 performConcurrentWorkOnRoot(root, didTimeout)
      exitStatus = shouldTimeSlice ? renderRootConcurrent(root, lanes) : renderRootSync(root, lanes)
      所以我们开始进入renderRootSync， 什么时候走concurrent晚点看 // TODO
        renderRootSync(root, lanes)
          movePendingFibersToMemoized 把root.pendingUpdatersLaneMap[index] 也就是updater forEach，获取到fiber  放到 root.memoizedUpdaters 中
          prepareFreshStack(root, lanes)
            创建了 workInProgress = rootWorkInProgress = createWorkInProgress(root.current, null)
              workInProgress = current.alternate 同时把current的属性都扔进去
              workInProgress.alternate = current
              return workInProgress
            finishQueueingConcurrentUpdates()
              里面在操作 react-dom 的全局 concurrentQueues,还记得它吗？去上面的文档中搜一下，在 pushConcurrentUpdateQueue 中添加进去的
              操作什么呢？吧queue里面的 interleaved = null， pending = lastInterleavedUpdate
              这里面有个重要的，queue.pending中，把last.next 和 first互相连接起来成为一个环形，见 备忘录13
            return workInProgress
          
          markRenderStarted(lane)  // 标记一下，开始 第二步 - render 了啊

          while(true) {workLoopSync(); break}  // 那每次都break，看起来也没有真的无限循环啊
          // break 能有效打断while true
          但是workLoopSync 里面的 while(wip !== null) {performUnitOfWork(wip)} 可是真循环啊
          没有走进 workLoopConcurrent 确实让人诧异
          // workLoop，经历了漫长的performUnitOfWork 以及 completeUnitOfWork，想象一颗树，start是开始深度优先，先下沉，到左侧底后，开始complete， 然后回归，回归后遇到了sibling，再创建一次start，然后complete，回归
        然后终于出来了，return workInProgressRootExitStatus [数值 = 5]
      回到performConcurrentWorkOnRoot，
      root.fihishedWork = finishedWork = root.current.alternate
      finishConcurrentRender(root, exitStatus, lanes);
        这里进入到 commitRoot(root) //! 里程碑 render finish
      

## 看一下上面的 workLoopSync
它是个无限循环了，估计有地方throw Error
  所以还是进入到了 performUnitOfWork 这个无限循环
看一下 方法中的 unitOfWork
里面三个字段。 current = unitOfWork.alternate
next = beginWork$1(current, unitOfWork, subtreeRenderLanes)
  return beginWork(current, unitOfWork, lanes)
    oldProps = current.memoizedProps
    newProps = workInProgress.pendingProps  (workInProgress === unitOfWork)
    因为是hostRoot， 所以 updateHostRoot(current, workInProgress, renderLanes). 看到有一个点，lazyComponents也在这里判断
      cloneUpdateQueue(current, workInProgress)
      processUpdateQueue(workInProgress, props, instance, renderLanes)  // 里面好大啊
        里面关于wip.updateQueue 各种拿取和连接
        关于current = wip.alternate, 对 current里面的updateQueue等进行各种拿取和对wip数据进行连接
        newState = getStateFromUpdate()
      reconcileChildren(current, workInProgress, nextChildren, renderLanes)
      wip.child = reconcileChildFibers(wip, current.child, nextChildren, renderLanes)
        return placeSingleChild(reconcileSingleElement())
          return createFiberFromElement()
      return wip.child
unitOfWork.memoizedProps = unitOfWork.pendingProps

直到next不存在，然后进入 completeUnitOfWork(unitOfWork), 此时的unitOfWork处于fiber链的最尾部，也就是说，自上而下完成了
注意： 这个最尾部，我应该这么描述，是来到了一棵树，最底层那一排的第一位置 // TODO ？ 存疑，但是实际就是这个，可能是我代码问题？


completeUnitOfWork() 有条件的自下而上
  // 整理当前这个fiber，比如文本也要创建一些内容附着在文本这个node上
  next = completeWork(current, completedWork, subtreeRenderLanes)
    里面有 一句 instance = createInstance(type, newProps, ...) 创建了虚拟dom实例哦
      domElement = createElement(type, props, ...)
        return domElement = document.createElement('h1') 类似这样的
      同时，precachefiberNode() ,把当前fiber，放进了domElement内 div.__reactFiber // 见附录15
      updateFiberProps() props 也放在了domElement中的，eg div.__reactProp 要知道，html的dom，是可以隐形储存一些东西的哦
      appendAllChildren(instance, wip)
        所以wip内部从child开始，遍历sibling，一个个的 div.appendChild(p) 类似这样子，直到回归自身
      wip.stateNode = instance也就是 wip和dom互相绑定了
      finalizeInitialChildren() 只绑定填充一些基础内容，比如children是纯文本/onscroll事件
      bubbleProperties(wip)

  
  // 刚才说了，在树的最底层的最左侧节点。所以遍历完后先找兄弟； 找不到，回去父级，然后父级的
  if (next) {wip = next; return} // 直接跳走， 回去beginWork那边

  if (siblingFiber !== null) {
    workInProgress = siblingFiber
    return
  }
  // 直到没有renturn的时候，才进入下面的
  wip = completeWork = returnFiber


  completeWork return的next就是个null 永远是null
//! 里程碑 - render补充版完成

## 进入commitRoot
  commitRootImpl(root)
  flushPassiveEffects() 触发一下副作用，比如useEffect
  把fiberRoot.finishedWork 存下来，然后清空 fiberRoot.finishedWork
  commitBeforeMutationEffects(root, finishedWork); // finishedWork就是 firstChild
    nextEffect = firstChild，进入 commitBeforeMutationEffects_begin()
      进去后对nextEffect进行loop  进入 commitBeforeMutationEffects_complete()
        commitBeforeMutationEffectsOnFiber(nextEffect)
        begin + complete 就是为了向上找有效的父dom节点

  操作finishedWork，也就是 commitMutationEffects(root, finishedWork)
    commitMutationEffectsOnFiber(finishedWork, root)
    因为tag，注意进入hostcomponent还是default
    进入到 recursivelyTraverseMutationEffects(root, finishedWork);
      不行的寻找 finishedWork.child or sibling,先深度child，然后sibling，向下的时候，每次都
      进行 commitMutationEffectsOnFiber(child, root);
    commitReconciliationEffects(finishedWork);
      tag === default 时， commitPlacement(finishedWork)
        getHostParentFiber()
          commitPlacement() 要替换了
            case hostRoot: insertOrAppendPlacementNodeIntoContainer(finishedWork, _before, _parent)
              _parent = parentFiber.stateNode.containerInfo -> 真实DOM
              _before = getHostSibling(finishedWork)
              这个insertOrAppend 也是循环，一直到找到hostcomp，比如div元素，进入到appendChildToContainer
                container.appendChild(child) or container.insertBefore(child, before)
  resetAfterCommit
    
  然后root.current = finishedWork 也就是current fiber的翻转，这时候就是逻辑执行完毕了
  commitLayoutEffects(finishedWork) 执行layoutEffect // TODO 啥时候被animation卡顿一下的？ 解释：不需要卡顿一下，无需等待浏览器绘制。只要appendChild后，就能够读取dom的style甚至css属性了

  接着onCommitRoot、 onCommitRoot$1
  ensureRootIsScheduled() 这之后页面会渲染








