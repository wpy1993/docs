## http 相关

### 相关知识点
- TCP 握手挥手
- tls 四次握手 (tls 1.3 优化为三次握手)
- http 1.0 、  1.1 、 2 、 3 区别
- CA证书
- https 加密方式 （非对称加密建立连接、对称加密进行数据通信）
- 简单请求 和 预检请求(preflight request)
- CORS
- [chrome浏览器的same-sit](./safety.md#samesite)
- http缓存


### TCP 握手挥手
- 三次握手建立连接； 四次挥手断开连接
- 三次握手： SYN -> SYN + ACK -> ACK



### tls 四次握手
- https 解决了 窃听风险、篡改风险、冒充风险。 解决方案分别是 混合加密，摘要算法、数字证书
- 对称加密快； 非对称加密安全。所以用`非对称加密`建立连接且生成`会话密钥`，后续的通信使用`对称加密`
- 四次握手： 
  Client Hello 
  --> Sever Hello 
  --> Client Key Exchange + Change Cipher Spec + Finished 
  --> Change Cipher Spec + Finished
- 每一次的应答，都会有一个ACK 别忘记了啊



### http不同版本区别
- 1.0 队头堵塞，队尾堵塞
  - 队头，包括从客户端一个一个发送出去；以及服务端一个一个处理响应返回
- 1.1 持久化连接 keep-alive 默认为true了 (1.0 也可以设置)
  - 在一个TCP中，可以并发发起多个请求了，也就是解决了`请求的队头堵塞` —— 但是 它不是默认开启的
  - 但是没有解决`响应的队头堵塞`
- 2.0 
- 协议变更了，底层的TCP协议变更为基于 UQIC 的 UDP协议



### 缓存
- 强制缓存 `Expires` / `Cache-Control`
  - Cache-Control **优先级更高**； 字段内部最主要的字段是 `max-age=123423`，毫秒为单位
  - 内容举例（知乎） - `Cache-Control: private, must-revalidate, no-cache, no-store, max-age=0`，
- 协商缓存 `If-Modified-Since & LastModified`  /  `If-None-Match & ETag`
  - 资源没有变化就返回 `code 304`
  - ETag **优先级更高**, 因为它没有明显短板
  - `Last-Modified: Fri, 22 Dec 2023 07:16:47 GMT` : 一个极其吹毛求疵的`缺陷`：**无法精确到毫秒**
  - `Etag=1be5d645f7f30c7889ea6517d5200b9b` 通常是一个资源的`hash值` 或者其他唯一标识符； `W/` 开头则表示为`弱Etag`
    - 关于 `hash值`，通常不可逆。 它是通过哈希算法 `MD5` `SHA-1` `SHA-256` 生成的`散列值`

- 关于`http code`，强制缓存，命中了会返回 `200(from memory cache)`; 协商缓存，命中了会返回`304 Not Modified`
- 为什么分 `强制和协商`。 因为 `强制缓存` 命中后，压根**不会去和服务器商量**
