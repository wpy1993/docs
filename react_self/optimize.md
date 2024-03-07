## react 优化手段 （主要讲useMemo和useCallback）

### 关于重复渲染、调用 - 主要讲memo
> 背景: 如果父组件触发了更新，那么子组件没有依赖更新时，依旧会触发render或者函数调用

解决方案
**Class组件**
1. 使用 `PureComponent`
2. 使用 `shouldComponentUpdate` 方法 拦截； return true / false
3. 使用 `memo` 缓存子组件
4. `getDerivedStateFromProps` 也算是个小优化，比如一些场景，需要根据props变化决定子state如何变化，有人就写在didMount/didUpdate中，不如直接写在这里

**Function组件**
1. 使用 useMemo 缓存值: 虽然useMemo接收参数为fn，但是fn是会被立即执行的
  然后，useMemo - `既可以在子组件中，缓存某个计算结果; 也可以 父组件中，把 该子组件 直接彻底缓存`
2. 使用 useCallback 缓存函数

#### useMemo 用法如下两个示例

```js
// 子组件中，缓存某个结果，num不变，计算不触发 —— 关于计算开销上的优化
const nameListNew = useMemo(() => {
  return nameList.slice(num);
}, [num]);
```

```js
// 把HeadComp 缓存下来，nameListNew不变，子组件不会被父级影响
// useMemo return 执行完毕的函数，所以如果是函数式组件，一定要包一层
const MemoHeadComp = useMemo(() => {
    return <HeadComp nameList={nameListNew} />;
  }, [nameListNew]);

// jsx 中这样调用
{MemoHeadComp}
```

补充说明：
1. 关于memo/useMemo，它们的初衷，都是防止父组件无脑带动子组件触发更新。但是不会防止子组件内部的自发更新
2. 关于useMemo，小心一点，如上，HeadComp 用到了nameListNew字段，但是如果 去监听[numOther]是否变化，那么nameListNew更新也不会触发 HeadComp的正常更新
3. 关于memo(component, equalFunction), 如果equalFunction 无脑 `return true`,说明props没变化，父级永远不会带动子更新，但是子的state变化还是会触发自己更新的
4. memo 返回 component本身。 useMemo 返回 执行完毕的函数，所以如果是函数式组件，一定要包一层


#### useCallback 说明
memorizedFn = useCallback(fn, [deps]) ,也就是将fn缓存下来，deps不变，这个fn永远不会变。
如此，
1. 当 memorizedFn 作为useEffect/useMemo 的 deps时，就不会无脑触发 useEffect/useMemo了
2. 当memorizedFn作为参数传递给子组件时，也不会无脑触发子组件的更新了 （作为参数传递这一点，可以和useMemo类比一下，useMemo传递具体数据，useCallback传递函数）