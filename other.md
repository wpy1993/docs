### 杂七杂八


#### CSP
- CSP **Content Security Policy** http的response的一个字段
> 研究 `new Function` 的时候遇到的，报错大约为`EvalError`，控制台所在页面 - npmjs或者github，报错原因是禁止`eval`或者`Function` 这种类Eval的方法  
> 看来CSP用来防止xss攻击
- 更多的看[safety.md](./safety.md)模块

[refer](https://www.imperva.com/learn/application-security/content-security-policy-csp-header)


#### new Function
- 说到Function，既可以new Function()，也可以不带new，没有影响，都会创建出来实例
  - Function.constructor，也就是 Function(args, functionBody),接受上面两种参数
  - functionBody是最后一个参数，类型为`String`，会被eval解析，所以才会触发`CSP`
  - args,非最后一个参数外的所有前面的参数都是arg，比如可以`(arg1, arg2, arg3, body)`; 另外非主流的，`('arg1, arg2, arg3', body)`也被承认



##### Object
- Object.freeze() 冻结，**configurable: false, writable: false**
- Object.seal() 密封， **configurable: false**
- 共同点： 1. 不可扩展 2. 元素不可配置，比如删
- 不同点： seal后，依旧可以修改属性的值。freeze不能
- 共同缺陷： 深层级对象依旧不被影响

- typeof [] === 'object' 所以typeof 的结果，没有array这个值
  - typeof拥有的值: object | undefined | boolean | number | bigint | string | symbol


- window.requestIdleCallback(callback, options)
  - idle 空闲的，懒惰的
  - callback接收一个参数，deadline, 比如 deadline.timeRemaining(), 这个字段，详见 IdleDeadline mdn
  - options: timeout 毫秒
  - React 18年就不再使用requestIdleCallback了，而是自己模拟实现了类似 requestAnimationFram的polyfill，功能在 scheduler package



#### compiler as Framework
react为啥要有hook
- Component 非UI逻辑复用困难
- 组件的生命周期函数不适合side effect逻辑的管理
- 不友好的 Class Component

- react/vue 都是 基于runtime 的框架，也就是说，框架本身的代码也会被打包进入bundle.js。框架根据runtime时的状态state计算diff出更新
- compiler as framework 在编译时就把应用（虚拟dom操作） 转换成原生的dom操作 （eg: svelte）


#### 位运算
> 思考的时候，千万不要把它转换成十进制去思考，就单纯的当作二进制思考，顶多几个特殊的记忆一下
> 按位 - 每一位都比较； 有符号 - 正数符号是0，负数符号是1
- 按位与 `&`  每一位 -> 1 && 1 -> 1 全都为1才是1
- 按位或 `|`  每一位 -> 1 || 0 --> 1  全都为0才是0
- 按位异或 `^` 每一位 -> 1 1 -> 0; 0 0 -> 0; 相同就是0
- 按位非 `~`  每一位 -> 1变成0； 0变成1
- 左移 `<<`  a的二进制左移 b(10进制) 位，右边0填充
- 有符号右移 `>>`  类似左移，但是1. 左侧需要补位，正数补0，负数补1
- 无符号右移 `>>>`  纯纯类似左移，左侧补位0

那么比如 A = 001; B = 010; C = 100
ABC = A | B | C  = 111
AB = ABC & ~C  = 011
想要剔除C --> ABC & ~C `& ~X` 可以用来剔除
想要判断是否包含C --> `ABC & C === C`; 如果 === 0，那就是不包含了。
想要分离出来最右边的1，看看哪个1更靠右 --> `A & -A`

所以React中用了大量的 0001， 0010， 0100， 1000 方便进行纯粹的位运算（不去考虑着怎么把它转换成十进制）


#### 标签语句 label: statement
> 看到React源码中的`getHostSibling()` 有`siblings while(true) {}` 产生了好奇

什么是标签语句，代码示例如下
```js
loop: while() {
  while() {
    if (xxx) {
      break loop
    }
  }
}
```
- 因为有些语句没有办法命名，所以label就是为了给它们起个标签名，这样到时候执行的时候，能执行指定的语句
- 常用于多层循环/迭代器，也就是`for` `while`，这样，`break or continue` 可以执行指定层，而并非只能打断当前层for循环

#### js operators precedence 操作符优先级
> `+ - *  /` > `=== or !=` > `&&` > `||`

但是，这里说的优先级，是 `表达式结合` 的优先级，并非 `运行的优先级`
所以 `let i = 1; let x = i`中， `i++` 结合优先级是 高于 `x = i` 的，但是运行优先级，`i++`是后置的，所以 `x的答案是1`

- 另外， `i++` `i--` `++i` `--i` 这种， 这里的 被操作的 `i` 一定是一个 **引用**, 而不是具体的值；另外它的返回值，是一个具体的值而不是一个引用，所以不能被二次操作，下面是两个错误示例
  - `5++` 错误， `5` 是具体的值，不能被这个运算符操作
  - `++i++` 错误， 因为 `i++` 返回的是个具体的值，无法继续进行 `++5` 这个操作
  - ps: `i++` 优先级 高于 `++i`, 虽然好像这个信息没啥用...

#### browser api
- window.atob   ASCII to binary 解密
- window.btoa   binary to ASCII 加密