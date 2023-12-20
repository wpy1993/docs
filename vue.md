## vue 常见优化手段

> vue，数据驱动的一个UI渲染框架。2.x通过 Object.defineProperty()中的setter、getter实现数据订阅通知。3.x通过 new Proxy进行数据订阅通知


### vue2 defineProperty
- vue2 中使用Object.defineProperty(obj, key, {
  get() {
    // 收集依赖 + 返回value
  },
  set() {
    // 设置新值 + 派发更新
  }
})

### 常见优化手段
- vue-for使用key
  - vue-for 使用 `稳定且唯一`的 key 。比如index是唯一，但是不稳定
- 使用冻结的对象 Object.freeze
  - 如果监听的对象，嵌套层级很深，但是这么深层级的对象，有时候不会局部改动，仅仅是想要存储时用对象存储。那么使用冻结的对象，避免vue `deepLoop` 把所有的深层对象都变成响应式
  - vue 一旦发现 Object.isFrozen 为true，就不再深度遍历了 (内部的 _traverse() 方法)
- 使用函数式组件
  - 组件增加一个属性 `functional: true`
  - 函数式组件，不仅减少了执行/渲染时间，而且减少了内存开销。因为vue**不会对函数式组件创建一个实例**
  - 正常组件，一个个都是VueComponent；函数组件，一个个直接都是内部第一个标签比如div
- 非实时绑定的表单项
  - 使用了v-model后，因为数据一直在变，vue在一直重新修改dom树，所以即使是合成线程（动画），也会被稍微影响
  - 也可以使用lazy解决v-model影响渲染这件事，但是小心数据更新不及时
- 保持对象引用稳定
- v-show 替代 v-if
- 使用defer  (vue /mixin  defer.js )
  - 本质是使用了 requestAnimationFrame
- 使用keep-alive
- 长列表优化
- 打包体积优化