# flutter 知识点

Widget
 - 代表一个UI元素的配置信息，是一个抽象类，不一定要有布局
 - 四颗树 --> Widget树、Element树、Render树、Layer树
 - StatelessWidget | StatefulWidget 

## 组件
### 基础组件
**Text**
```dart
Text("hello world!"*4,
  maxLines: 1,
  overflow: TextOverflow.ellipsis,
  style: TextStyle(fontSize: 20,
    color: Colors.red,
    fontSize: 18.0,
    height: 1.2, // fontSize * height
    fontWeight: FontWeight.w900,
    fontStyle: FontStyle.italic,
    decoration: TextDecoration.underline,
    decorationColor: Colors.blue,
    decorationStyle: TextDecorationStyle.dashed
  ),
  textAlign: TextAlign.center,
  textDirection: TextDirection.ltr,
  softWrap: true,
  textScaleFactor: 1.5
)
```

Text是个widget组件；TextStyle服务于style属性，用于指定文本的显示样式如颜色字体粗细背景
`Text.rich`说明，`Text`就是`RichText`的一个包装，而 `RichText` 是可以显示多种样式（富文本）的**weidget**

**Button**
ElevatedButton | TextButton | OutlinedButton | IconButton
```dart
  IconButton(
    icon： Icon(Icons.thumb_up),
    onPressed: () {}
  )

  ElevatedButton(
    child: Text('normal'),
    onPressed: () {}
  ) // TextButton OutlineButton 同理

  ElevatedButton.icon(
    icon: Icon(Icons.send),
    label: Text('send'),
    onPressed: () {}
  ) // TestButton OutlineButton 同理

```

**Image**
```dart
Image(
  image: AssetImage() | NetworkImage(),
  width: 100.0, // height, color, colorBlendMode, alignment, repeat
  fit: BoxFit.cover, // fill, contain, cover, fitWidth, fitHeight, none
)

Image.asset('', width: 100.0)

Image.network('', width: 100.0)
```

**Siwtch & Checkbox**
继承自 `StatefulWidget`, 有 `value`、`onChanged回调` 两个主字段，以及`activeColor` 等
checkbox 大小/宽高 是固定的。switch只能定义宽度、高度是固定的

**表单和输入**
- Form - FormField | FormState
- TextField

TextField 自定义样式 - `decoration: InputDecoration`

**进度指示器**
- LinearProgressIndicator
- CircularProgressIndicator

共同拥有 value | backgroundColor | valueColor: Animation<Color> 三个属性, 另外 Circluar 特有属性 --> StrokeWidth


### 布局类组件

**组件分类简介**
- LeafRenderObjectWidget          - 叶子节点、无子组件
- SingleChildRenderObjectWidget   - 仅支持单一子组件
- MultiChildRenderObjectWidget    - 支持多个子组件

**布局模型**
两种布局模型
- 基于`RenderBox`的 盒模型 布局
- 基于`Sliver(RenderSliver)`的 按需加载 列表布局


**约束容器**
- ConstrainedBox - 给子元素添加 `额外的约束` - 如果有多重限制，取数值大的那个，而并非取最近的
- SizedBox - 给子元素指定 `固定宽高`
- UnconstrainedBox - 去除额外的约束


**线性布局/弹性布局**
- Row 水平方向 - 继承Flex
- Column  垂直方向 - 继承Flex
- 当子widget超出屏幕范围时，会报溢出错误

- Flex - 弹性布局
- Expanded - Flex类型组件中可用，扩展剩余空间
- Flexible - 可以在 Row 和 Column 的子组件中使用，表示扩展剩余的空间，但是可以设置 flex 值，flex 值大的占据剩余空间多


**流式布局**
- Wrap - 常用
- Flow - 不常用，性能好、难度高


**层叠样式/定位**
- Stack - 维护一个定位容器，子元素可堆叠
- Positioned - 容器内乱定位即可

- Align | Center - 内部只能有一个子元素，有点类似于 `position: relative;`

**layout builder & afterlayout**
- LayoutBuilder
- AfterLayout - callback方法返回元素位置信息等


### 容器类组件
容器类组件，一般没有任何排版功能，不负责子组件的布局，只负责控制子组件的大小及位置

- Padding - 内边距
- DecoratedBox - 装饰容器 - 绘制一些装饰
- Container - 容器
- Transform - 变换
- ClipRect | ClipOval | ClipRRect | ClipPath - 裁剪
- FittedBox - 空间适配
- Scaffold - 页面骨架

```dart
Padding({
  child: xxx,
  padding: EdgeInsets.xxx,
})

Transform.translate(
  offset: Offset(10.0, 10.0),
  child: xxx
) // 同理还有rotate、scale


Container(
  margin: EdgeInsets.only(top: 50.0, left: 120.0),
  constraints: BoxConstraints.tightFor(width: 200.0, height: 100.0),
  decoration: BoxDecoration(
    gradient: RadialGradient(
      colors: [Colors.red, Colors.orange],
      center: Alignment.topLeft,
      radius: .98
    ),
    boxShadow: [
      BoxShadow(
        color: Colors.black54,
        offset: Offset(2.0, 2.0),
        blurRadius: 4.0,
      )
    ]
  ),
  transform: Matrix4.rotationZ(.2),
  alignment: Alignment.center,
  child: Text(
    '520',
    style: TextStyle(
      color: Colors.white,
      fontSize: 40.0
    )
  )
)

```







## refers
[Flutter实战·第二版](https://book.flutterchina.club/)