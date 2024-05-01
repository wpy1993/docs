# react 18 源码调试/阅读入门指南

> 标题名字没想好，但是这一部分主要讲的是，最简单粗暴的方式探索react源码。react web版有什么代码。献给 想要从头到尾、有序地 研究源码的你



> 阅读要求：不适合完全没有接触过react的人，适合长期开发react、并且已经通过文章了解过React所谓的Fiber架构、可打断更新、三大阶段（Scheduler、Reconciler、Renderer），但是读源码（相关的文章）很抓瞎的你。



## 目录大纲

- react源码概述
- 说烂大街的react三大阶段
- 源码总览：react和react-dom的关系
- 到底谁、在哪里，可以被打断
- 为什么要用messageChannel/setTimeout
- 如何调试源码（具体版）
  1. 使用官方提供的react-demo.html
  2. 搭配webpack的简单调试



## react源码目录概述

> 为什么要先讲这个，因为需要知道，react这一套工程里面，有什么



讲这个之前先锁一下版本，react为v18.3.1

react的git仓库地址：[在这里](https://github.com/facebook/react/tree/v18.3.1)

随着它越来越庞大，我们直面这个仓库，会感到一些无力感，这是一个monorepo，内容都在 `/packages`中，主要分为三大块

1. react 核心运行逻辑 - react
2. react 视图驱动逻辑 - react-dom / react-native / react-art 等
3. react 工具库 - 包括 react-reconciler、 scheduler、shared等

但是，上面都不重要，因为我们关于 **react web版** 调试时，能给我用的，就两个打包后的文件，`react.development.js` 和 `react-dom.development.js` 。

最快的调试方式就是复制 [官网](https://react.dev/learn/installation#try-react-locally) 的 [示例](https://gist.githubusercontent.com/gaearon/0275b1e1518599bbeafcde4722e79ed1/raw/db72dcbf3384ee1708c4a07d3be79860db04bff0/example.html) 后直接浏览器打开、打开调试工具的`performance / source+root.render()处打断点`开始调试。如此下来，我们简单明了的知道，react源码应该包含什么：

1. react.js
2. react-dom.js



## react三大阶段

个人感觉，react和vue给人最大的区别，

- vue是跳脱的，通过反应式系统，你可以粗暴的理解为发布订阅模式/观察者模式，在初始化设置data的时候，就通过defineProperty/Proxy劫持set和get，进行定制化的数据处理和视图更新
- react是循规蹈矩的，每一次的mount/update，都是自上而下，从步骤一开始一步步走到试图更新



大家都知道，react 16以后的流程，是三大阶段：1. Schedule阶段 2. Renderer阶段 3. Commit阶段，那么如果我们认为这就是react.js的话，其实调试时，会抓瞎的 —— 为什么我的调试，不断的在 `react.js` 和 `react-dom.js` 中跳来跳去？而不是如我所愿的，react.js 执行完所有的以后，再一次性推给 `react-dom.js` 去执行视图操作？

我直接给出答案，因为react就是属于工具类，贴近我们数据的逻辑大头在react-dom中



## 到底谁、在哪里，可以被打断

接下来聊两个话题

1. react一次事件更新中写了多个setState，如何一起调度更新
2. react的打断更新在哪里

问题1其实大家都看过，什么参考了 requestAnimationFrame,用了 requestIdleCallback，后来实现了自己的一套 requestHostCallback。本质上就是延迟执行。什么是本质？

