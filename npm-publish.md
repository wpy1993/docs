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

