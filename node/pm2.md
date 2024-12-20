# PM2

> a daemon Process Manager, help manage and keep application online.  - 守护进程管理器 / NodeJs进程管理工具



指令集合

- basic

  - `pm2 start app.js`

  - `pm2 stop all`

  - `pm2 delete all`

  - `pm2 list/ls/status`

  - `pm2 restart all`

- advanced
  - `pm2 monit`
  - `pm2 logs [--raw]`
  - `pm2 show [processMetadata]`
  - `pm2 reset all`
  - `pm2 save`
- update
  - `pm2 update` after `npm upgrade & install pm2 -g again`
- others
  - `pm2 flush`
  - `pm2 scale app +3`  /  `pm2 scale app 2`
  - `pm2 ecosystem` - generate **ecosystem.config.js** file



### 配置文件内容

`pm2 init` - 生成一个ecosystem.config.js

`pm2 start xxx` 后面支持参数

- --only "name1, name2"
- --env env_name



**配置文件 pm2.json 示例如下**

如果script想要使用npm能力，要找到npm 的 bin安装位置

```json
{
  "apps": [
    {
      "name": "frontend",
      "cwd": "./frontend2backend",
      "script": "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js",
      "args": "run dev"
    }
}
```











### log file name - 日志文件枚举

- error_file
- out_file
- log_file
- pid_file
- merge_logs
- log_date_format
- log_type

如果想要disable 某个file，可以设置 eg `log_file: "/dev/null"`





### persistent app - 持久化

`pm2 startup` / `pm2 unstartup`  - windows 默认不支持









#### 英文单词

daemon /dimen/ - 魔鬼、守护进程，后台程序

persistent 持久化的、持续的、执意的

