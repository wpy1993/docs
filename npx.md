## npx & npm some

### 补充一下npm知识点 - 缓存
首先从 node_module 找到，否则全局找，否则就registry中下载到本地
指令
npm cache clean -f
npm config get cache --> 获取缓存路径，如 `/Users/wplay/.npm`


### npx

#### 能力1 - 直接在外部终端 terminal/cmd 运行某个工具库
比如项目cli，全局安装 `webpack-cli`, 全局只能存在一个，也就是只能存在一个版本，所以不推荐全局安装
所以一般本地安装。不同的工程安装不同的版本库，然后 终端中 指令运行时，需要 `node_modules/.bin/webpack xxx`,麻烦

所以引出了 npx
`npx webpack` 直接从当前 node_modules 中寻找`webpack`, 或者从上级缓存中找webpack (是不是类似 npm寻找包缓存？)

#### 能力2 临时下载包
接上面最后一句话, 从上级/全局中找，或者是 临时从registry下载到缓存(不是下载到全局哦，缓存是不定时被删除的)

不过有个小点，比如， `vue指令`来自于`vue-cli`，所以需要 `npx -p @vue/cli vue create xxx`
`-p [registory]` 指定资源


### npm init
`npm init -y`, 这个 `-y` 就有意思了，是 yes 的意思
搜到了指令的说明： `npm init [--yes|-y|--scope]`

特殊的
`npx create-vite proj` === `npm init vite proj`
`npx @dxy/create-react` === `npm init @dxy/react`
也就是说
`npm init 包名`   等效于 `npx create-包名`
`npm init @命名空间`   等效于 `npx @命名空间/create`
`npm init @命名空间/包名`   等效于 `npx @命名空间/create-包名`

命名空间就是比如有些企业的包，统一用 `@公司简写 eg @dxy/` 作为一级目录