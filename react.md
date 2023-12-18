## 面试题系列 - React 相关面试题


#### real dom vs virtual dom
- virtual dom 和 real dom的节点一一对应，也是一个属性结构，多次创造后，一次性渲染，这样减轻了浏览器渲染引擎的压力 - 频繁 repaint 和 reflow
- jsx 是语法糖，通过babel，将我们看到的dom结构，转换成js的对象结构 `React.createElement(tagName, attrObj, ctx)`
- [react的生命周期diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
  - getDerivedStateFromProps、shouldComponentUpdate、 render、 getSnapshotBeforeUpdate、 componentDidMount/Update
- 触发dom change的三种方式 - setState、props change、forceUpdate
- hooks 初始化第一次也会触发useEffect(fn, [state1])，不清楚是不是state1初始就有值导致的，反正可以通过封装 useEffectNoDidMount 避免

```js
const useEffectNoDidMount = (func, ops) => {
  const ref = useRef(false);

  useEffect(() => {
    if (!ref.current) {
      ref.current = true;
      return;
    }
    func();
  }, ops);
};
```

#### 事件执行顺序
onClick 是`事件委托`，也就是说，事件是绑定到顶层上面的。优点，节省内存，优化页面性能。一个function + 一个事件池列表，是好于100+个function监听的
    - 方式: 挂在是一个顶层，可以是document、也可以是足够靠上的一个div，然后通过event.target 判断来源
    - 变化: React 16及之前，是直接把事件添加到document。React 17及以后，是通过rootNode.addEventListener
    - 为什么变化：方便多版本react共存（所有版本的react事件都在document上会有问题）；document的事件委托变化会影响全局所有事件

React为了提升事件绑定的性能，当事件结束后，`合成事件回调对象，会被立刻销毁`，所以有时需要使用`e.persist()`来保存状态

- addEventListener 就是事件委托，第三个参数，可以是options，也可以是useCapture (type boolean；是否捕获阶段使用)
- 冒泡和捕获执行的顺序，思考一个个嵌套的盒子，捕获时，从父到子；冒泡时，从子到父。
  - 如果父中有多个委托代理，依旧遵守此秩序，且多个委托全都完成后，才会进入到下一个父/子

- refer
  - 参考 [react事件委托机制详解](https://juejin.cn/post/6927981303313006599)
  - [React18 合成事件](https://juejin.cn/post/7183952097161773093?searchId=2023121312122986BC65F7D47F0C8FDB81)


### vue
- vue2 中使用Object.defineProperty(obj, key, {
  get() {
    // 收集依赖 + 返回value
  },
  set() {
    // 设置新值 + 派发更新
  }
})