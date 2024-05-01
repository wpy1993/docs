安装mysql

terminal中
通过 mysql 判断是否安装和启动

登陆
> mysql -u root -p

> show variables like 'character\_set\_%';

退出
> exit;  或者 quit;


接下来讲一下全局mysql的停止运行、启动
> sudo /usr/local/mysql/support-files/mysql.server stop  
> sudo /usr/local/mysql/support-files/mysql.server start  
> sudo /usr/local/mysql/support-files/mysql.server status  

但是注意一点，macOS中，如果你是在settings/mysql 直接`按钮启动`的，那么会报错找不到pid
> "ERROR! MySQL server PID file could not be found!"

另外我电脑中 `/usr/local/`下面关于mysql有两个文件夹，`mysql-8.0.28-macos11-x86_64` 和 `mysql`。仔细看一个，`mysql`其实是另一个的软链/alias
不清楚是不是安装mysql大家都这样，软链名字更短嘛，方便用


