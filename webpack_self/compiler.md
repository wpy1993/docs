## compiler 遇到的一些方法详细


compiler.compile() 函数中有如下额外函数，也就是可以认为是 compiler.hooks的call(调用)，以及别的一些方法
compiler的hooks

- `hook.beforeCompile.call`
- `hook.compile.call`
- `newCompilation`
- `hook.make.call`
- `hook.finishMake.call`
- `compilation.finish`
- `compilation.seal`
- `hook.afterCompile.call`


在一个极度基础的webpack中，来一个个的看一下做了什么事吧

#### hook.beforeCompile.call  —— 没人调用
#### hook.compile.call
- ExternalModulePlugin 调用了，订阅compilation的params.normalModuleFactory.hooks.factorize…

#### newCompilation
- createCompilation()  —— 就是 `new Compilation()`,里面的constructor都是定义，先无视
- compiler的hooks，接连调用了 `hooks.thisCompilation.call` 和 `hooks.compilation.call`
  - **hooks.thisCompilation.call**
  - `thisCompilation`, 唤起了9个钩子，我感觉重要的是 `SplitChunkPlugin`
  - 这几个hooks，都是订阅compilation.hooks, 我最常看到的订阅callback内容是 `compilation.addRuntimeModule()`
  - 关于 `SplitChunkPlugin`, 看到它在用 `compilation.modules`, 也看到一个字眼 `compilation.hooks.optimizeChunks.tap`

  - **hooks.compilation.call**
  - 唤起了47个钩子，要不放弃吧，关注一下 `6. EntryPlugin` `12. HarmonyModulesPlugin` `27. ImportPlugin` `30. ImportMetaPlugin` `43. DefinePlugin`
    - `HarmonyModulesPlugin` 给`compilation.dependencyTemplates` 设置了一堆值；同时订阅 compilation 的`normalModuleFactory.hooks.parser`
    - `ImportPlugin` `DefinePlugin` 同上， 估计所有的plugin都一样，在`hooks.compilation`这个阶段

#### hooks.make
- `EntryPlugin` 订阅了它, 内容是 `调用 compilation.addEntry()` 回头研究 TODO

#### hook.finishMake.call
- 这里注意一下哈，好像是直接把所有的流程都结束了，包括上层的 `compiler.ru`n和上上层的`CLI.run()`，才会回到这里
- 此时 `compilation.modules` 已经存好了路径和内容了。内容在`_source`中，是纯净的内容，好像还没被处理，仅仅是字符串


#### compilation.finish
忘了，回头补充 TODO
反正里面有些内容，感觉不重要，比如遍历modules

#### compilation.seal
创建图，也就是 `compilation.chunkGraph`， 图里把 module 存储了
调用 hooks.seal  好像不重要
调用 hooks.optimizeDependencies  —— 好像重要，调用了`SideEffectFlagPlugin`, 看起来在打标记，改代码，好像并没有
调用 hooks.beforeChunks
buildChunkGraph    —— visitModules + connectChunkGroups
调用 hooks.afterChunk
调用 hooks.optiomize 等一系列
调用 hooks.optimizeTree

一路狂奔，进入到了 `compiler.emitAssets（）`， 这里输出了文件资源，然后才调用callback
所以文件输出都是在`emitAssets`，怪不得网上那么多人说答案，不说过程，太绕了


### 文件到底在哪里生成
通过源码断点，找到了，文件内容首先被拼接，是在 `JavascriptModulesPlugin.js` 中，针对不同的`chunk`，设置不同的 `render = xxx`

内容填充流程（包括前置流程）: 
`compilatioin.createChunkAssets` -> 把`compilation.chunk` 给 `compilation.getRenderManifest` -> 这里 `hooks.renderManifest.call` 唤起了 `javascriptModulesPlugin` -> 返回了`manifest` -> 拿着上面的`manifest`, 同步的 `getPathWithInfo` 获取路径信息 ->  然后调用上述的 `render` 函数把内容拼接了  -> 触发 `compilation.emitAsset`

> 请注意一点， `compilation` 中 有个方法 `emitAsset`, 它并不创建文件； `compiler` 中有个方法 `emitAssets`, 它才是创建文件并填充内容的

文件创建流程，主要在`compiler`中: 
1. `Compiler.js` 中， `emitAssets()` -> `hooks.emit` 钩子 —> `hooks.emit` 钩子， 然后其callback -> `emitFiles`
2. `emitFiles()`中， 读取 `compilation.getAssets()`，然后将`assets`循环着 `getContent() && doWrite()` -> 完成