## 依旧webpack知识点，但是属于自己研究源码系列

webpack dev 模式下，导出的有下面几块
- `__webpack_module__: {filePath: eval(xxx)}`, 看起来像是存储每个用到的文件，缓存相关吧
- `__webpack_require__`  定义了 o r 等方法， 当出现 `es6 的 import/export` 才会出现它
- `__webpack_exports__`  被 require 调用； 没有 require 它也会存在

内部有 `/* harmony export */` 标识, 待梳理

一句代码 `export const name = xxx`, prodution 模式直接给清除了
一句代码 `console.log(123)`, production 模式保留了下来

如果出现了 import/export ， 那么就会进入 "use strict" 模式，比如得到的答案是
`(()=>{"use strict";console.log(123)})();`

### 流程
预先说明: 
`->` 表示函数内部的继续调用
`-->` 表示平行函数之间的连接

**cli中** `runCLI` -> `new WebpackCLI().run` -> `runWebpack` -> `createCompiler` -> `loadConfig, buildConfig` --> `compiler = this.webpack()`

> 结束！ 没有watch的情况下，这就是全流程！  
> 也就是说，先 **new 出来一个 WebpackCLI()**， 然后**cli.run()** 里面层层配置后，触发 **this.webpack()**,  webpack里面 `{compiler, watch, xxx} = create()`后，create出来的`compiler.run()`就是真正的主流程了。如果你断点直接跳过了`this.webpack()`，恭喜你，什么都不会得到了  

> 认真解释一下: `compiler` 被层层return，传回到 `runWebpack`, 如果有监听，`compiler`继续被使用， 否则，`runWebpack`就结束了全过程

打断一下，`buildConfig`出来的`config`, 里面有两个对象，options和path， options这里天然带上了一个 CLIPlugin

### 所以，我们要开始抓webpack() 这个流程了

> 前置代码, webpack中创建了compiler后进行run，然后所有的完毕之后，进行`compiler.close`，如下。close之前，所有操作就已经完毕了, dist/bundle.js生成， cli内容也全都执行完毕了(如果没有watch)

```javascript
// webpack/lib/webpack.js
compiler.run(() => {
  compiler.close();
});
```

> Compiler.js 文件中
run -> 调用一些 `beforeRun` `run`的钩子 & `readRecord` --> `this.compile` -->  cb = `onCompiled` --> `done` 钩子 & finish

> 所以关键在 上面的 `this.compile` 中，继续挖这个函数
`params = newCompilationParams` 合成参数  --> `beforeCompile` 钩子 ->  `compile` 钩子 --> 创建`compilation` --> `make` 钩子 --> `finishMake` 钩子 --> compilation.`finish` --> compilation.`seal` --> `afterCompile` 钩子 --> 结束！


> 再来看看 `newCompilationParams`
参数内部有两个字段: `normalModuleFactory` `contextModuleFactory`
- `normalModuleFactory`
  - clean last  && `new NormalModuleFactory()` : NormalModuleFactory.js 执行中又发现了几个hook - **factorize -> resolve -> afterResolve -> createModule -> module**
  - 调用 `hooks.normalModuleFactory` 钩子
  - 返回 normalModuleFactory
 
- `contextModuleFactory`
  - `new ContextModuleFactory()`，
  - 调用 `hooks.contextModuleFactory` 钩子
  - 返回 contextModuleFactory


> `this.newCompilation()`  进入到 `Compilation.js`
cleanupLastCompilation && `new Compilation()`
看一下 Compilation构造函数，贼大
记几个东西， 暂时不知道有啥用 **@TODO**
- this.mainTempaltes  this.chunkTemplates  this.runtimeTemplate  this.moduleTemplates
- this.moduleGraph  this.chunkGraph
- this.addModuleQueue  this..factorizeQueue  this.buildQueue  this.rebuildQueue


> `ModuleGraph.js`


> 还得回到 `hooks.make` 中
我们会发现，触发了订阅 `EntryPlugin` 这个通知name

然后有些中断了，回头补上，addEntry addModuleTree  this.factorizeModule




### 关于tapable的hooks生成
`beforeRun`: tapable [Hooks.js]: CALL_ASYNC_DELEGATE -> _createCall -> [AsyncSeriesHook.js] COMPILE -> [HookCodeFactory.js] create


this.running = true 控制着下次run直接return
留意this.idle, 可能和清理缓存/缓存有关
run 内部还有beforeRun、 run、 readRecords、 compile

`LazySet.js` 一些函数很好啊，可以学学