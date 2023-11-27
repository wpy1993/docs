## npm 发布相关

> 基础发布就不说了，配置好账号以后，直接npm publish即可

### 发布忽略某些文件
- 方案1
  - package.json中，配置 `files` 字段 **string[]**，决定publish哪些文件
- 方案2
  - 2.1 配置.npmignore文件决定忽略哪些文件，用法和.gitignore一样
  - 2.2 当.npmignore不存在的时候，.gitignore会被看作替补


### 一些说明
- 优先级, 经测试，`pkg.files` >> `.npmignore` >> `.gitignore`，三者只有一个生效
- **node_module**、**yarn.lock**等文件会被自动忽略的
- 发布前，查看自己即将publish的内容是否正确，可以 `npm pack` 进行检查

### refer
- [如何过滤 npm publish 的文件](https://cnodejs.org/topic/58b3aaea7872ea0864fee130)
- [npmjs-keep file out of your package](https://docs.npmjs.com/cli/v10/using-npm/developers#keeping-files-out-of-your-package)
- [package.json - files](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files)



## lerna VS yarn workspaces
> 这两个都是包管理工具，都是在管理 **Monorepo （单一仓库多包）** 的优秀工具。react使用的是`yarn workspaces`模式

### 讲讲历史
> 一般来说，后发布的其实更加轻量和好用。lerna更早发布，功能大而全。而`yarn workspaces`是一个轻量的mono-repo管理工具，

### 不说对比，只说共赢
   - 因为版本不停的在变，大家都在取长补短，逐渐长得相似，所以没啥好对比的。比如`lerna7`，把`workspaces`这个选项内置为true了
   - yarn workspaces更适合前期的依赖安装和管理，lerna对于构建发布等，有更好的集成，所以用于后期的打包构建
   - 创建项目，lerna.json中配置 `npmClient: yarn, useWorkSpaces: true`，就好了
   - 这样，所有的依赖都在根目录级别，子包里面的 node_modules中，只有软链。这样就防止了不同的包所需要的依赖有冲突这件事

### refer
- [lerna 7.0.0 - changelog](https://github.com/lerna/lerna/blob/main/CHANGELOG.md#700-2023-06-08)
- [yarn about workspace](https://classic.yarnpkg.com/lang/en/docs/workspaces/#toc-how-does-it-compare-to-lerna)

### 存疑
- lerna 7,执行后，子包中出现node_modules，为软链。但lerna 6，执行npm install后，仅仅全局安装了node_modules，没时间去深入了解...


## npm peerDependencies
- 写在这里的模块，不会被重复安装过多次。为了兼容包的版本而存在