## react hooks


- useState
- useEffect useEffect 在fiber tree处理完成之后，渲染之前就工作
- useMemo - 见 [optimize](./optimize.md)
- useCallback - 见 [optimize](./optimize.md)
- useContext
- useImperativeHandle
- useLayoutEffect 也就是页面渲染完毕后，下一次event loop才会执行的函数


### useState的一些说明
const [num, setNum] = useState(initialValue: 999)
1. 首次加载时，num值是 initialValue； update时， 会从存储的 [999, xxx] 读取，（这个hooks的值存储在一个数组中，下标为0的地方值是999）
2. 所以 hooks 不能放在for/if 中，否则，下标对应的值，不对了，就会出问题
3. useState的一个小优化点，`setNum` 这种函数，是被 `缓存` 下来的，避免了每次更新时的内存开销
4. 如果setNum() 里面的值没有变化，那么这次更新会结束。这是react的一个小优化，比对方式是 `Object.is(preVal, nextVal)`,所以引用类型比对的也是地址
5. 连续的 `setNum(n + 1); setNum(n + 1)` 会被合并，因为上来就计算好了。需要改成 `setNum(prev => prev + 1); setNum(prev => prev + 1)` 这种函数式的写法


### useContext
先说之前非hooks模式，使用 createContext 创建一个对象，对象内有两个东西 - Consumer 和 Provider。 useContext主要是对Consumer进行优化
旧示例代码如下

```js
const ctx = React.createContext()

const Demo = () => {
  return (
    <>
      <ctx.Provider value="1234">
        // Consumer 消费者，能够拿到value的一个存在； 我们可以看到，Provider和Consumer写在一个jsx中，虽然这毫无意义
        // 不友好的一点 - fiber结构多了一层ctx.Consumer - 嵌套更深了
        <ctx.Consumer>
          {value => `value is ${value}`}
        </ctx.Consumer>
      </ctx.Provider>
    </>
  )
}
```

接下来，使用 useContext把 ctx.Consumer

```js
const ctx = React.createContext()

// 简洁一些了吧； 当然不可否认一点，useContext 一定要在Provider之后（也就是当作子组件）执行，才能够拿到value，所以必须拆分了
const Child = () => {
  const value = useContext(ctx)
  return `value is ${value}`
}

const Demo = () => {
  return (
    <>
      <ctx.Provider value="1234">
        <Child />
      </ctx.Provider>
    </>
  )
}
```


### useRef
返回一个固定的对象 `{current: value}`
之前的createRef， 只建议用在class中，放在function中，每次 Function 刷新，都会导致重新create
```js
  const divRef = React.createRef()  // 把ref放在这里，有安全隐患，如果多处场景都使用了这个文件，那么divRef只会是最后一个的
const Demo = () => {
  // createRef 放不到这里，否则每次都会被重置
  
  return <div ref={divRef}></div>
}
```

所以 useRef ，可缓存版的 createRef，就因为function而应运而生了

```js
const Demo = () => {
  // 诺，如果用来当 dom的ref，写法跟没变化似的
  const divRef = React.useRef()
  
  return <div ref={divRef}></div>
}
```

另外，既然说了 useRef 不会被更新了，以及它就是一个对象，所以它可以存储万物，让其在function更新的时候，不会被重置。
比如，有人无脑把setInterval写在function（非useEffect中）中，如果你不存储，或者简单存储，每次刷新都会丢失上一个的地址，且创建新的。

#### 关于ref，多说一点， forwardRef
因为function组件，是没有对象的，无法给它安置ref，比如 

```js
const RefTest = () => {
  const ref = useRef(null)
  return <ChildFunc ref={ref} /> // 因为ChildFunc 是function，所以ref失败, 控制台也会有warnning: Function components cannot be given refs
}
```

所以通常怎么办呢？ 好像没办法。  但是可以用 forwardRef (**ref转发**)， 寻找到function 内部的可被绑定的dom/虚拟dom， 如下

```js
// 绑到了div上面，forwradRef也就是给ChildFunc注入了第二个参数 - ref
const ChildFunc = (props, ref) => {
  const test = () => {}
  return <div ref={ref}>123</div>
}
const RefTest = () => {
  const ref = useRef(null)
  const ChildFuncWrapper = React.forwardRef(Child)
  return <ChildFuncWrapper ref={ref} />
  
}
```

但是我想要ChildFunc内部的 test 这个方法呢？ 如下，两种方式
1. ref.current = {} 粗暴的绑定
2. useImperativeHandle(ref, () => ({}), deps) 绑定，根据deps是否变化决定是否更新 - 也就是**缓存版**的 `ref.current = {}`

```js
const ChildFunc = (props, ref) => {
  const test = () => {}
  // 方法1 棒！ 把Child 内部的方法都可以暴露出去了 - 就是每次ChildFunc更新，其实远方的ref.current都会跟着动一下
  ref.current = {
    test: test
  }, 
  // 方法2， 缓存版 - useImperativeHandle
  useImperativeHandle(ref, () => ({test: test}))
  return <div>123</div>
}
// ...RefTest省略
```



refer
[一文吃透react-hooks原理](https://juejin.cn/post/6944863057000529933)