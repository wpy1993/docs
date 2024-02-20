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
- ![TCP 头部格式图](https://cdn.xiaolincoding.com//mysql/other/format,png-20230309230534096.png)
- 三次握手建立连接； 四次挥手断开连接
- 三次握手： SYN -> SYN + ACK -> ACK
- 四次挥手： FIN -> ACK + FIN -> ACK; 注意，第二部是两次挥手，因为服务端是分开发的，发一个ACK，然后状态更改为`CLOSED_WAIT`，再发`FIN`
  - 为什么服务端的ACK和FIN要分开发呢？因为可能有数据没有传输完成，所以中间可能经历继续发数据，也可能没经历

> 讲解一下TCP头部格式
除去基本的`源端口号` `目标端口号` `数据` 等。主要有几个
- `序列号` 32位   缩写为 `ISN` —— Initial Sequence Number
- `确认应答号` 32位,    缩写也是 `ISN` 啊
- 控制位 四个常见的`SYN`、 `ACK`、 `FIN`、 `RST`； 两个不常见的 `URG` `PSH`. 他们都是 `0 和 1`
  - `SYN` 为 **1**, 希望建立连接， 这时候 `序列号` 就有用了 —— Synchronize
  - `ACK` 为 **1**, 收到了，这时候 `确认应答号` 就有用了 —— Acknowledgement
  - `FIN` 为 **1**， 表示**希望关闭连接**  —— Finish
  - `RST` 为 **1**， 出现了异常，强制断开 —— Reset
  - 两个特殊处理字段:  `URG` —— 紧急字段指针(Urgent Point)，只能从哪开始是紧急字段;  `PSH` —— Push, 希望接收方快速交付上层

> 讲解一下三次握手
前提条件 —— 服务端开启某个端口的`监听`
-->  第一次，客户端发送 一个 `SYN=1`, 此时表明，`序列号 client_isn` 被随机生成了
-->  服务端表示了解，开始回复， 此回复标识有 `ACK=1`, 同时也发一个`SYN=1`. 此时表明， `确认应答号 server_isn` 被填上了 `client_isn + 1`，`服务端的序列号`也重新创建了一个
-->  客户端收到后，发现，对方回答正确，我也要回答一下对方，所以再发一次， `ACK=1`, 此时表明，这次的 `确认应答号` 被填上了 `server_isn + 1`,序列号就空着吧

- ps：前两次握手不太安全，大家都不带数据，第三次握手比较安全了，此时客户端可以带着数据去沟通了 —— 提效
- 如果因为网络问题，客户端发送了多个 `SYN 90` `SYN 100`. 服务端收到后，回复`ACK 91`， 然后接着可能会回复 `ACK 91`(称之为 **Challenge ACK**),没错，依旧回复第一次的 num，而并非更改为 `ACK 101`. 那么客户端懂了，服务端你已经不对劲了，发你一个 `RST`


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
