## webpack 5 主要变化

### 内置 clean-webpack-plugin
构建完成输出之前，清除之前的dist目录时，不需要安装上面插件了，只需要配置中

```js
module.exports = {
  output: {clean: true}
}
```

### top-level-await
允许直接使用await，不需要 包裹一个函数，标记为async。 不过它依旧是一个实验功能，需要开启配置
w3c官方也在讨论中，所以浏览器是不接受的。所以webpack原理也是，在将代码包裹成函数的基础上，额外带上一个async标识

```js
module.exports = {
  experiments: {
    topLevelAwait: true
  }
}
```

### 打包体积优化
对 `模块的合并`、`作用域提示`、`tree-shaking` 等处理更加智能
1. 针对有些简单的文件，并不需要包裹一个立即执行函数了
2. 分析 嵌套的复杂 依赖关系时，更准确和智能

### 内置打包缓存
webpack 4 需要 cache-loader 缓存打包结果
webpack 5 默认开启打包缓存

webpack 5 默认把缓存放在内存中，如果想要更改，可以通过cache配置更改，示例如下：

```js
module.exports = {
  cache: {
    type: 'filesysem', // 默认为 memory （内存）
    cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack')
  }
}
```

缓存为二进制文件，如 `0.pack` `1.pack` 等等

### 资源模块
webpack 4， 通过file-loader、url-loader、raw-loader，把资源（图片/文本/音频等） `获取原版路径` / `转换成 base64 等二进制文件` 等

webpack 5 默认支持了，可以自定义配置如下

```js
module.exports = {
  output: {
    assetModuleFilename: 'assets/[hash:5][ext]'
  },
  module: {
    rule: [{
      test: /\.png/,
      type: 'asset/resource', // 作用类似于 file-loader
    }]
  }
}
```

refer
[Custom output filename](https://webpack.js.org/guides/asset-modules/#custom-output-filename)

小知识点  
raw-loader to import a file as a string 直接获取内容并变成字符串，适合文本资源  
url-loader to inline a file into the bundle as a data URI 变成dataUrl: base64  
file-loader to emit a file into the output directory  纯输出/copy  

css-loader，就是解析css，包括是 url() 和 @import 等  
style-loader 把样式内容植入到dom的style属性中
MiniCssExtractPlugin 把本该在js bundle的中的css内容，抽出来，变成css文件
开发环境，一般用style-loader + css-loader，产生css文件的同时，把css样式写到 dom的style属性中，方便调试  
生产环境，就不用style-loader了，产生css文件后，把css从js bundle文件抽取出来，也就是 MiniCssExtractPlugin + css-loader
