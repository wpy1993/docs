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