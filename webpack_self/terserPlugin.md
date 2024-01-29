### terser-webpack-plugin

> 学完了webpack，发现plugin这么简单，就去看一下TerserWebpackPlugin的实现  
> 最主要看一下，它是如何开启多线程的，这里我们也只讲线程相关

使用方法

```javascript
new TerserPlugin({
  parallel: 4,  // 表示设置最多四个线程
}),

```

1. 订阅了 `compilation.hooks.processAssets` 这个钩子,这个钩子，在 `seal中 -> compilation.createChunkAssets()的callback`中触发
2. 循环遍历assets，创建N个 `_workerPool`, 注意，这里`WorkPool` 继承自 `BaseWorkerPool`，所以constructor在后者中
3. `WorkPool`中循环 设置好的 `numWorkers`. 每一个都生成一个 `Worker`
4. 根据条件判断用哪个`Worker`，能优先用 `NodeThreadsWorker` 就用，否则用 `ChildProcessWorker`
- `NodeThreadsWorker` 使用 **Node.js** 的 `worker_threads.Worker`
- `ChildProcessWorker` 使用 **Node.js** 的 `child_process.fork`
  



### 关于 parallel 会被怎么处理
传入了 parallel 字段后，对比
1. os.cpus().length, 获取最小值 `availableNumberOfCores` (获取不到 os.cpus(), 就认为是单核服务器)
2. 继续比，获取所有 **待生成的资源**`numberOfAssets`，再获取最小值 (比如如果只处理一个文件，用不着2个线程)
生成 `numWorkers` 数量

### 总结
所以，所谓线程，就是创建了多少个 `worker` or `child_process`
创建了多少个呢？ `assets数量` * `numWorkers数值`

`assets` 表示要输出的资源，并不是引入的资源数量
假设服务器的cpu数量为无限
比如设置线程为1，待生成资源数量为2，那么创建两个线程
比如设置线程为2，待生成资源数量为2，那么创建四个线程

这个我是有疑问的，为啥会是这样呢？创建 2 * 2 个线程/进程？


参考
- [webpack 性能优化](https://zhuanlan.zhihu.com/p/425076452)