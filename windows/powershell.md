# powershell 使用



#### powershell 打开当前路径的文件夹

- `explorer(gl)`
- `start .`
- `ii .`



#### powershell 样式美化和增强

- 旧的思路 （但是废弃了，因为 oh-my-posh 不推荐使用`Install-Module` 了。[官方迁移文档](https://ohmyposh.dev/docs/migrating) ）

1. 打开管理员模式的powershell
2. `Install-Module PSReadLine`  若首次使用会提醒安装**NuGet**，同意；
3. `Install-Module posh-git`
4. `Install-Module oh-my-posh`

上述2-4步骤都会有信任询问

[参考文档](https://cloud.tencent.com/developer/article/2317806)

不对，Install-Module 在 `oh-my-posh` 那边已经被拉黑了。放弃



- 新的思路 - 还是安装 `oh-my-posh`，它就类似于macOS中的 `oh-my-zsh`

1. 确定powershell中是否能使用`winget`。如果为否，去 windows的应用商店下载 `winget`
2. 安装oh-my-posh `winget install JanDeDobbeleer.OhMyPosh -s winget` （翻墙贼快）；没翻墙就手动下载
3. 重启powershell即可。但是如果确实没有效果，重新安装、或者手动添加路径，例如`$env:Path += "C:\Users\admin\AppData\Local\Programs\oh-my-posh\bin"`  - 路径替换为自己的路径，一般不用换

[参考官方install](https://ohmyposh.dev/docs/installation/windows)

设置字体失败了，暂时放弃，进行需求开发去

