# 顺丰速运签到 (APP)
事先声明本脚本非本人构建  
只做失效修复  
原作者仓库  
https://github.com/chavyleung/scripts/tree/master/sfexpress

## 配配 (Loon)

## Loon插件添加获取Cookie  
```properties
https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/cookie/sfexpress.cookie.js

```
##  定时脚本  
```properties
https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/sfexpress.js

```
## 也可以用下面的
```properties
[MITM]
hostname = ccsp-egmas.sf-express.com

[Script]
http-request ^https:\/\/ccsp-egmas.sf-express.com\/cx-app-member\/member\/app\/user\/universalSign script-path=https://raw.githubusercontent.com/ways0210/scripts/master/sfexpress/sfexpress.cookie.js, requires-body=true, tag=Rewrite: 顺丰速运
cron "1 0 * * *" script-path=https://raw.githubusercontent.com/ways0210/scripts/master/sfexpress/sfexpress.js

```
##  配置 (Surge)

```properties
[MITM]
hostname = ccsp-egmas.sf-express.com

[Script]
Rewrite: 顺丰速运 = type=http-request, pattern=^https:\/\/ccsp-egmas.sf-express.com\/cx-app-member\/member\/app\/user\/universalSign,script-path=https://raw.githubusercontent.com/ways0210/scripts/master/sfexpress/sfexpress.cookie.js,requires-body=true
cron "1 0 * * *" script-path=https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/sfexpress.js
```

## 配置 (QuanX)

```properties
[MITM]
hostname = ccsp-egmas.sf-express.com

[rewrite_local]
^https:\/\/ccsp-egmas.sf-express.com\/cx-app-member\/member\/app\/user\/universalSign url script-request-body https://raw.githubusercontent.com/ways0210/scripts/master/sfexpress/sfexpress.cookie.js

[task_local]
1 0 * * * https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/sfexpress.js
```

## 说明

1. 配置重写
2. `APP` 我的顺丰 > 任务中心 > 去签到
3. 提示 `获取会话: 成功`
4. 注释重写

