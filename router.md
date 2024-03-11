## 聊聊路由

### hash模式 和 history模式
> 基于react-router； 然后本地如果想要跑起来dist，history模式需要 `serve -s` （-s 指单页面模式）

**开始对比 hash vs history**
1. 肉眼上看，hash模式就是 带了个 # 符号。 所以对比就是 `.com/#/login` 和 `.com/login`
2. 代码路由创建，就是 `createHashRouter` 和 `createBrowserRouter`
3. 从http请求看，就是请求 `.com/` 和 `.com/login` 的区别
4. 从 3 可以得知，所以history mode 需要服务端/nginx支持，**第一次请求** `.com/login` 的时候，强制重定向到 `.com/`
5. history模式 里面路由跳转的时候，也就是非首次请求的时候，路由里面劫持了`history 和 location` 等，不会请求服务端了
6. hash 模式，里面路由跳转的时候，额外劫持了 `hashchange` （但hash模式本身hash变化就不会请求服务端）


所以 history 模式需要额外做一些事情，1. 服务端强制定向到index.html; 2. 前端劫持路由变化，强制不请求服务器

补充一下，nginx 关于 history模式的配置

```bash
location / {
  try_files $uri $uri/ /index.html
}
```


### refer
[在nginx上部署react项目的实例方法](https://zhuanlan.zhihu.com/p/550797323)