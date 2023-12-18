## babel 面试题相关

### 阶段说明
1. `parse阶段` @babel/parser 把源码转换成AST
2. `transform阶段` @babel/traverse 遍历AST，可修改其内容
3. `generate阶段` @babel/generate 把AST打印成目标代码字符串，同时生成sourcemap

