## git

> git相关，不打算写太多，毕竟都用烂了，能玩出花的也就rebase、cheer-pick了

- git pull是哪两个指令的集合：git fetch 和 git merge FETCH_HEAD

- git hooks有哪些，可以打开项目`.git`文件夹，查看`hooks/`文件夹列表，日常主要是用到了`commit-msg` 和 `pre-commit` 两个钩子，配合`husky`，做一些校验