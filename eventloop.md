# Event Loop 事件循环

### 进程 process
- 每个app至少有一个`内存空间`，可以简单认为是 **进程**, 每一个 内存空间 互相独立
- 进程空间之间的通信，通过`IPC`进行通信 **(Inter-Process Communication)**， 通信需要双方同意
- 进程 创建时一定会**至少有一个线程**，也就是说至少有一个**主线程**在跑。如果没有线程，进程将被 `垃圾回收`


### 线程 thread
- `线程`是进程中的一个**生产线**，用来进行 一系列的任务


IPC具体通信方式？
我好像记得是发布和订阅等模式


### 浏览器的进程
- 进程有 `浏览器进程、网络进程、渲染进程` 等 （打开`chrome -> more tools -> task manager` 可以查看）
- 浏览器进程就是打开chrome的主进程、`其负责界面展示、用户交互、子进程管理等`
  - **界面展示**: 非tab内的html之外的展示，比如tab栏、导航栏、标签栏
  - **用户交互**: 用户点击前进后退、用户在哪个tab进行了滚动等手势操作
  - **子进程管理**: 启用时顺便启动各种子进程如 网络进程、渲染进程、GPU进程、Storage进程、各种extention的进程等
  - **渲染进程**: `每个tab`都是一个独立的渲染进程，里面有各种线程
  - PS: 打开控制台，`每个控制台`也是一个**独立的进程**

#### 渲染进程
- 每个`tab标签（渲染进程）`都有 一个渲染主进程，用来执行 html、css、js代码
- 未来chrome浏览器可能会优化/节俭渲染进程，因为一个标签页一个进程，会导致内存吃的太多了。以后会针对一个站点（域名）一个进程.(参考chromium docs -> Modes and Availability)
  - Full Site Isolation (site-per-process) - 针对pc桌面
  - Partial Site Isolation - 针对 chrome for android （2GB+ RAM）. 等等


### 渲染主线程 Main Thread
- 所有的前端任务都在 渲染主线程中，包括 DOM、CSSOM、渲染和重绘/分层、js逻辑运行、外来的线程通信过来的任务。他们都是Event Loop
  - 外来的线程通信过来的任务: setTimeout是计时器线程、api(fetch)是网络线程、addEventListener是用户交互线程。具体线程名称不必在意，在意的是**它们都不属于浏览器进程**
- chrome中，while(true) | for(;;) 来进行**无限循环**执行任务。但是没有任务就会休眠，有任务就会for无限循环
- Event Loop 事件循环
  - 有一个事件(消息)队列 message queue;
  - 宏任务和微任务按一定的顺序进来
  - 其他线程的任务过来，比如浏览器的用户交互里的线程传递过来的任务
  - 异步任务，是合适的时间，把callback方法放在任务队列task中，而并非通知主线程去寻找当时的callback并执行
  - div.textContent = '123'，这句话其实是 **两步骤，1. change text 2. render到屏幕上**，所以如果`div.textContent = 123; endlessLoop(3000)` 会3s之后页面内容才变成123


### Event loop（chrome中叫message loop）

- 关于node 10、node 10之后、node 10之前，查看web-practice项目中的eventloop.js
  - 主要区别，关于多个setTimeout瞬间生成的任务，10以后认为，他们属于不同的主任务，一个一个来；10认为一瞬间的产物，应该属于同一个主任务；10之前就直接紊乱了
- chrome中，不止宏任务和微任务，应该分为 执行中的主任务；然后队列分为 微任务队列 > 交互队列 > 计时队列。也即是说，如果**点击事件**和**setTimeout 1000ms后的callback**同时到达或者同时堵塞排队中，先把微任务队列放进主任务执行，然后点击事件放进主任务执行，最后把计时的callback放进主任务执行

- 如下示意，一个渲染线程，下面跟着N个队列
  - === 渲染主线程（主任务）执行消息队列 -> 既然开始渲染，上来就会有一个**主任务**被塞进来
  - --> 微任务队列 （w3c标准强制浏览器厂商将其标记为最高优先级）
  - --> 交互事件队列 ele.onClick = () => {}  （较次一级的高优先级执行内容）
  - --> 定时任务的callback队列
  - --> 各种任务队列，优先级各种各样，但是基本实际上无感知

- setTimeout嵌套超过5层，即使设置为0ms，第6层依旧开始是4ms执行 （w3c规定的）
  - setTimeout有多不准 - 本来电子钟就不准；容易被死循环堵塞；需要event loop排队；

> 单线程是异步产生的原因；事件循环是异步的实现方式  
> 异步叫啥：计时线程进行计时；网络线程进行数据获取；交互线程同步用户操作；这些线程通过IPC通信，把 任务/callback 推给渲染线程管理的各种优先级不同的队列


### 问题
Q1: 代码中的console.log，到底是不是在渲染主线程中执行的呢？
A: 不知道，不过猜测啊，这是浏览器的Web Api实现的，专门特供给控制台实现的，比如你不打开控制台，就不会出现这个数据。那么执行还是在主线程要执行这句话的，比如对着 `控制台这个进程` 进行IPC通信。
另外，翻了些文章，辟谣一些内容
1. 浏览器中的console是同步的，nodeJs中的console是异步的 —— 它调用了I/O进程； --> 错误，nodeJs中也是同步执行的
2. console.log出来的对象，不会被垃圾回收； --> 错误，会被垃圾回收。除非你打开控制台，但是控制台是一个独立的进程，可能对象都是重新拷贝过去的呢

Q2: event loop无限循环中，如何休眠
A： 参考GPT，1. 阻塞方式，消息循环会等待事情完成，所以它被动挂起线程 2. 非阻塞方式下，通过 `非阻塞的机制` 等待事件。
C++中可以通过`sleep_for`api进行休眠，chromium具体实现是`event_.Wait()`（操作系统决定等待时间）和 `event_.TimedWait(next_work_info.remaining_delay());`
具体实现参考[chromium message_pump_default](https://github.com/chromium/chromium/blob/main/base/message_loop/message_pump_default.cc)

Q3: html是渲染一个显示一个吗？比如FP、FCP会被堵塞吗？
会的，执行完最初的主任务，才会渲染first paint等

Q4: requestAnimationFrame是宏任务还是微任务
A: 它的callback，会被丢到**宏任务队列**中，但是，它被放入的时机，是不确定的，和页面渲染完成有关，所以和 `setTimeout 0` 放在一起时，无法说出来，谁先执行