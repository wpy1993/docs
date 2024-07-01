# python 基础



## macOS中，设置python别名 和 pip别名

**更正**
> 下面是错误的。/usr/bin/pip3地址有些问题，升级以及pyinstaller都不在这里  
> 然后在 `/Users/wplay/Library/Python/3.9/bin` 下面找到了
> 所以正确的做法是 - `~/.zshrc` 文件内容写入 `export PATH="$PATH:/Users/wplay/Library/Python/3.9/bin"`

----原文----
> macOS自带python，如果找不到，说明可能是 `python3`，使用指令 `python3`就可以开启。  
> python 就是类比于`node`，pip类比于 `npm`.我们也只能找到`pip3`

- 那么，给python3起个别名叫python吧，否则好麻烦
ternimal中输入
`echo "alias python=/usr/bin/python3" >> ~/.zshrc` 打开新的即可
注意：我们默认你的`ternimal/iterm` 默认安装并使用 `oh my zsh`

- pip3 同理
`echo "alias pip=/usr/bin/pip3" >> ~/.zshrc`

[参考](https://stackoverflow.com/questions/71591971/how-can-i-fix-the-zsh-command-not-found-python-error-macos-monterey-12-3)



## macOS中，打包构建.python文件
安装 `pyinstaller`
按理说`pyinstaller ./demo.py`即可。但是我安装后，显示找不到指令。所以按照官网推荐，暂时用`python -m PyInstaller ./demo.py` 代替一下
macOS中，打包出 `dist/demo` 和 `demo.spec`文件(不清楚干嘛用)
`dist/demo`直接拖拽到terminal中就可以执行
上面一个内容中，根据更正后的，pyinstaller路径正确了，可用。
