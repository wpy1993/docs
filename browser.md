## 浏览器渲染相关

> 也就是一个问题，从输入一个url到完成渲染，浏览器内发生了什么

1. DNS查询，域名 -> ip -> 获取html

2. （渲染主线程）`Parse` —— 解析html内容，构建DOM树；解析css内容，构建CSSOM树；合并DOM和CSSOM，构建新的树
    - 有一个辅助线程进行预解析（**预解析器**），快速浏览html中的link/script标签，如果需要网络请求，调用网络进程提前下载
    - 如果解析过程中，遇到了立即执行的js代码，就会去执行js代码，因此而堵塞html->css的解析
3. `Recalculate style` 合并CSSOM树上的属性，到DOM树上
    - 此时每个节点都有属性了，该计算的计算，该根据优先级合并的合并
4. `Layout布局`，构建新的树
    - 和DOM树体量不同，比如会隐藏`display none`的节点，div内部的文件，会插入**匿名行盒**（类似inline/inline-block的节点）
5. `Layer 分层`，比如`will-change: transform`会被分层，分层利于频繁reflow的节点
6. `Paint 绘制`，也就是绘制他们的一条条指令（类似canvas）
7. （合成线程）`Tiling 分块`，交给**合成线程**（该线程依旧属于渲染进程），`每一图层都有一个分块器`将每一层按照位置分成诸多小的区域，方便定位哪些块处于屏幕中，优先渲染
8. `Raster 光栅化` 将每个块都变成位图，优先处理靠近屏幕视图的哪些块 （光栅化，就是把图片转换成带颜色透明度信息的位图的过程）
9. `draw` 合成线程为每一个图块生成`draw quads`，
10. 把处理好的最终指令集交给 `GPU线程` 加速解析、最终渲染到屏幕上


参与者
1. 网络进程、渲染进程中的渲染主线程、渲染进程中的合成线程、浏览器GPU进程

整个流程
**渲染进程-渲染主线程**
parse --> style --> layout --> layer --> paint -->
**渲染进程合成线程**
tiling --> raster --> draw -->
**GPU进程**
屏幕render


### refer
[【精简版】浏览器渲染机制（完整流程概述）（下）](https://developer.aliyun.com/article/975891)


### 通信
#### 进程之间的通信 IPC Inter-Process Communication
- 管道 Pipes
- 消息队列 Message Queues 有相关api的
- 共享内存 Shared Memory
- .etc

> chromium中，比如渲染进程和网络进程，是使用自己的Mojo IPC通道进行通信，可以发送多个消息且是异步的  
> Mojo IPC，实现方式是结合了 Message Queues 和 Shared Memory两种方式


### 线程之间的通信
- 共享内存 Shared Memory
- 互斥锁 Mutex
- 消息队列 Message Queue，比如C++中的 `std:queue`
- .etc

> chromium中，比如渲染进程中，有渲染主线程、合成线程（Compositor Thread）、V8线程（执行js）、网络线程、Worker线程等  
> 主线程和合成线程之间，却依旧是使用 IPC机制 进行通信的，依旧是 Mojo IPC


### IPC优点
- 安全性，通过消息传递等方式实现同步操作，确保任意时刻只有一个线程访问关键资源
- 异步通信
- 跨任务分离 Task Isolation，提高系统的秉性度和性能

#### Mojo IPC 额外优点
- 低延迟
- 跨平台性，Mojo是一个跨平台框架
- 灵活性和扩展性



### 渲染主线程和V8线程 执行js
> 他们都可以执行javaScript代码
- 渲染主线程关注初始化js代码、以及dom操作的js
- v8关注异步操作，比如定时器、事件监听等，以及密集任务