### homebrew install error
比如我先要 `wget https://www.baidu.com`爬取页面，要安装 `brew install wget`,报错了
报错内容: **unknown or unsupported macOS version: :dunno**
原因： 系统升级后，可能 brew 也需要升级了，先`brew update`，如果有提示，跟着提示 完成update

[参考](https://github.com/orgs/Homebrew/discussions/941#discussioncomment-1634448)


### git push好慢
ternimal中 `git push timeout`； `ping www.google.com` 也失败； 明明开了代理，chrome也能打开

原因:
1. terminal没有经过代理，而是直接查询 `1.缓存、然后 2.hosts文件，然后 3.dns` 三步 查询github的 `ip地址`。代理没生效，那只能靠ip了，有时候网不好就这样了.
2. 顺便解释了下浏览器为啥可以，因为代理在更高的层级，ternimal读不到，但是浏览器可以读到。所以浏览器的查询是 `vpn白名单地址、 浏览器缓存、 hosts文件、 dns查询` 四种
3. 也就是说，主要是代理没有干涉到`ternimal`



解决方案
host （macOS中的 `/etc/hosts`文件）手动添加 github.com 的ip地址，比如 `192.30.255.113  github.com`
**注意**，这里不能写成 `www.github.com`
ps: 打开hosts文件，才发现自己里面曾经写过类似的，还有注释 `# git clone too slow, release next`...

