## 安全相关

### 结构目录
- CSRF
- XSS
- CSP
- cookie - SameSite
- cookie 属性

### CSP
- Content-Security-Policy字段, 内容可以比如 `default-src 'self'; img-src *; script-src a.com`
- 一般发生在初始化中，后端在`获取html这个接口`中的响应头中返回这个字段; 或者是前端html代码中天然有 `<meta http-equiv="Content-Security-Policy" content="xxxx">`

### csrf
`Cross-Site Request Forgery` 跨站伪造请求。 通俗地讲，B网站刻意请求A网站的接口，会自动带上A网站的cookie；B网站不会关心A网站的cookie内容

如何防御
- 关键信息不要放在cookie中，而是放在一个令牌token中，比如叫他`csrfToken`.初始化后端给你，你存起来，每次请求自己捞出来，拼接在api后面
- 浏览器也在努力，纷纷开启`SameSite`选项，让`cookie`无法在 发起请求的域名和被请求的域名不一致时，仍然流通
- 后端也做判断，判断`request header` 中的`Referer`字段和本服务器域名是否一致 —— 但是容易被伪造

### XSS
`Cross-Site Scripting` 跨站 脚本攻击。 简单举个例子，返回给你的html中，注入一段js，偷取你的信息。比如 js内容 为读取`document.cookie` `localStorage.getItem('id')`。或者是提交给后端的表单，里面有一段`SQL攻击`

如何防御
- 后端在`set-cookie` 时 添加 `http-only` 标识; storage别乱存储东西
- 前端提交、后端接收时，进行一下过滤，不要无脑传递/接收
- 把获取到的数据转义。比如 遇到 `<script` 就转为 `&ltscript`


## cookie相关

### SameSite
`SameSite`，是`Cookie上`的一个`属性`, 有三个值 `Strict` `Lax` `None`
基本所有的浏览器 的较新版本 都支持 samesite 属性了，比如 chrome 51+

- `Strict` 百分百禁止第三方cookie
- `Lax` a  link form/GET 三个，可以发送cookie

chrome 将 `Lax` 变成默认值. 如果想要使用 `SameSite=None`， 那么需要 设置cookie另一个属性 `Secure=true`,也就是
`Set-Cookie: xxxxxxx; SameSite=None; Secure`

[SameSite的浏览器支持情况](https://caniuse.com/?search=SameSite)

### cookie属性
- domain 比如知道浏览器会调用 `别的域名` 的接口，那么后端提前设置好那些`域名所需的cookie`; 所以一个网页，如果有调用第三方资源，我们可以看到，`cookies` 中，有`不同的domain`的`cookie`
- `expires / max-age` 是的，`cookie` 也有 `max-age` 字段，它和http缓存的那个`max-age` 不是一个东西啊
- `secure` 严格来说，它只是一个标记，没有值，所以可以认为，一旦 `set-cookie` 有这个字段，就类似于 设置为true了。 这个字段表示，请求必须是https或者其他安全协议
- `httpOnly` 就是只能response-header设置，不能够通过 `document.cookie` 读取到

