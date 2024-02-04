## react 基础知识查漏补缺

> 没错，学习过程中，我竟然发现甚至有些基础文档内容，我都漏掉了

### 类型检查及默认值
- Function.defaultProps = {num: 1}
- Function.propTypes = {num: PropTypes.number}
  - v15.5.0之前  `import {PropTypes} from 'react'`
  - v15.5.0及其以后 `import {PropTypes} from 'prop-types'`


### 纯redux - 可用于非react的js代码
首先，维护好一个store（配置好reducer）。然后两步引入
1. `<JSX store={store}>` 传递store，每层都要传递哦
2. `store.subscribe(render)` 订阅，且把页面刷新方法比如 **react.render**交给store

所以 redux更新dom的本质 就是疯狂的调用react的**render**方法

### 二次封装的react-redux
看到了上面的几个小痛点： 层层传递、多个store需要手动命名、自己写一下订阅、hooks怎么使用。所以优化版的 `react-redux` 就出现了
创建store时，可以`configureStore({})`多配置维护，然后
1. `<Provider store={store}><App/></Provider>`， 无需层层传递
2. 哪个组件需要，就那里调用呗 —— `useSelector` `useDispatch`
3. 不过它全面拥抱`hooks`,所以想要class中使用，就需要 比如`@connect()` 连接一下了