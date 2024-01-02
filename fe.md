## 前端纲领相关

> framework和library的区别
- framework 约束代码结构； library属于被调用关系

### 工程化
- 是一系列的工具和手段，达到某些目的
  - 宏观角度 - 为团队前端制定约束、提升效率
  - 微观角度 - 脚手架、构建工具、CI等等
- 手段：包管理、模块化
  - 上述两个的本质： 分解和聚合


### 前端知识分类
- 语言 html css js nodejs
- 协议 http websocket oauth2
- 环境 浏览器 webapi dragApi observerApi fileApi canvasApi nodeApi 小程序 ...
- 框架和库 vue react axios egg ladash moment
- 服务器 node express koa mysql redis mongodb
- 工程化 ts sass less stylus


### 名词
cli: command-line interface 命令行操作界面
GUI:  Graphic User Interface  图形操作界面

### 包管理
- npm不好用导致衍生出来很多第三方指令如:
  - pnpm yarn cnpm bower(浏览器) - 后两个基本没人用了
- monorepo ？ 耳熟 比如 lerna 等


### 工程化需要关注的问题
- 语言问题 兼容性、语言缺陷
  - css css-in-js styled-components 后置语言postcss？
  - js
    - es6 有些比如Array.prototype.flatten 是水域api兼容性的，可以模拟出来；有些比如微队列、canvas，是模拟不出来的，叫语法兼容性，这个没有大而全的库
    - api兼容性，polyfill(国内翻译为 垫片，英文翻译为填充物)。一般99%都是使用**core-js**这个大而全库，解决兼容性问题
    - 语法兼容性（比如promise微队列、解构、 webApi）,一般称之为 `转换工具 syntax transformer (runtime)` - 无大而全的库，比如**regenerator**这个库解决 async-await 问题
    - 代码集成转换工具 - babel，搭建一个舞台，所有的转换工具都可以被集成进来 （当然大家babel也经常用来做兼容问题的处理）
- 工程问题
  - 文件指纹、代码压缩
- 流程问题 预发布、灰度发布


### babel
- babel-core 提供转换的核心
- babel-cli 可以在命令行中输入指令、调用转换能力
- babel配置中，plugins太多了，所以可以使用预设功能，也就是presets，比如把基础预设 `@babel/preset-env` 配置进去
- 补充一个 SWC， 对标babel、用rust语言编写，号称转换很快（并非转换后的运行很快）

- 推荐网站 codepen 他们使用的`html增强语言`是**haml**

### css问题
1. 语法缺失 - 循环、判断、拼接
2. 功能缺失 - 颜色函数、数学函数、自定义函数
解决方案： 预编译语言sass/less -> 预编译器 -> css -> 后处理器 -> css
- 预编译器： 新语言（超集）进行增强， 比如 sass/less/stylus -> css预编译器 -> css语言
  - 编译器，比如sass的编译器就是sass
    - 额外提一句，sass语法，.scss 和 .sass 后缀都是ok的，有细微的书写区别，但是无关紧要
- 后处理器： 生成css后，还要生成厂商前缀、代码压缩、代码剪枝、类名冲突
  - 对应的分别可以是 autoprefixer\ cssnano\ purgecss\ cssModule
  - 可以使用`PostCss` 作为平台，把它看作CSS届的babel
  - extra: postcss是把css转换成css，但是如果这个transfer支持sass，那么postcss不是也可以是`预编译+后编译`都支持嘛，不一定非要认为它是后置处理器



- commonjs，exports、module.exports、module 三个区别？