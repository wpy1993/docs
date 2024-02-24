## 一些指令

> 我遇到的一些指令，可能不限于linux

#### find
find [path] [pattern] [action]
因为我要查找`docs`这个项目，所以我只记住了这条指令 `find ./ -name docs`

问了下GPT，给出一条很复杂的，匹配到 `/docs/webpack.md` 的指令 —— `find ./ -type d -name "docs" -exec test -e '{}/webpack.md' \; -print -prune`，了解就好

-path 后面不能跟正则表达式
