## 微前端

> 阅读一篇关于微前端的文章的笔记，主要是讲qiankun，文章链接在底部 refer

### Iframe不行
- 隔离性和通信复杂性
- 性能和加载时间
- 样式和布局限制
- 浏览器安全性限制

所以选择什么
- Web Component、 Javascript模块加载器 等

### 微前端运行原理
四步顺序
1. 监听路由变化
  关于 `hash变化` window.onhashchange 可以监听  
  关于`history路由操作`   `window.onpopstate`可以监听部分， history.`pushState / replaceState` 需要**重写**
2. 匹配子应用 —— 根据 `pathname` 寻找子路由
3. 加载子应用 —— 加载和渲染放在一起，因 `innerHTML=xxx`，**浏览器安全考虑**script标签会被转义,除非`document.write`
4. 渲染子应用 —— 主要还是js，内联script直接eval； 链接模式，fetch到数据后 `eval( res.text() )`


### qiankun
1. 基于 `single-spa` 实现， 使用 `import-html-entry` 包处理 html/css
2. 子包 输出格式为 umd，且要允许跨域。  `Universal Module Definition`, 一种通用模块定义格式
3. qiankun的样式隔离有问题，还是自己做好不冲突的准备


### 微前端框架举例
- qiankun: function + proxy + with
- micro-app: web component
- wujie: web component + iframe


### refer
- [深入浅出微前端（qiankun）](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615883&idx=2&sn=ad0638e95ee31ba993ddc25ae16f93b0&chksm=8022a54ab7552c5c6a404e33ceb76e053c4beedfa939d6879609c3bbe89816223a61f599c86c#rd)