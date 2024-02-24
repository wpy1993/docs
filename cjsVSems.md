## commonJs vs ES Module

### commonJs
1. `非官方标准`，是社区提供的，所以它只能是语法糖，不是全新的语法
2. 是`使用函数实现`的 `require`
3. 因为非官方的，所以浏览器天然不支持，`仅支持node环境`（因为是node社区搞出来的）
4. `动态依赖`。因为它可以出现在任何地方，比如`if else` 中，只有代码运行了，才能知道它有没有依赖谁、被执行。
  ps: 所以它有缓存，永远只运行一次，有bug
5. `动态依赖是同步执行的`, 比如require 是通过 I/O 硬盘读取的，但是它是同步的，所以很慢

### ES Module
1. 官方标准，全新语法
2. 必须写在最外层，不能 if、 while、 function 等嵌套
3. 同时支持 `静态依赖` 和 `动态依赖`
  静态依赖 —— import a from 'xxx'
  动态依赖 —— import('./a.js').then
4. 动态依赖是异步的 —— import() 是一个promise，并不会堵塞代码后续执行
5. 符号绑定 - 也就是 **地址传递**， `import {num as n}`, n并没有开辟新的内存空间，而是一个地址而已
  修复： `import {num} ; const n = num` 此时 n 和 num 就是两个内存空间了
6. 返回一个 Module对象，里面有一个特殊的值，叫default, 所以 `Module {default: xxx, a: 1}`



### commonJs原理

```js
function require(path) {
  if (缓存) return 缓存

  function _run (exports, require, module, __filename, __dirname) {
    //  模块放在这里，所以函数中运行，变量不会污染全局
    // 一个js文件，直接console.log(arguments),会发现打印出来了 —— 因为arguments是函数特有的，并非window特有的
  }

  var module = {
    exports: {}
  } // 大家导出常用的 module.exports 或者 exports 就来自于这里

  _run.call(
    module.exports, // call的第一个参数是用来当this的
    module.exports,
    require,
    module,
    模块路径,
    模块所在目录
  )

  把module.exports 加入到缓存。然后，
  return module.exports
}
```

所以代码中，你使用 `this.b` 或者 `exports.b = xxx` 效果一模一样。但是使用 `module = xxx` 那就破坏了上述的 `module对象`； `module.exports = {}` 就是破坏了 `exports对象`

