#!name=顺丰速运Cookie抓取
#!desc=使用方法：打开顺丰APP →我 →（左上角）积分。定时脚本地址：https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/sfexpress.js
#App链接=
#!author=ways0210[https://github.com/ways0210]
#!tag=
#!system=
#!system_version=
#!loon_version=3.5.3
#!homepage=https://github.com/ways0210/Loon-Js/tree/master/js
#!icon=https://cdn.jsdelivr.net/gh/ways0210/Loon-Js@master/icon/sfexpress.PNG
#!date=2026-11-25 05:10

===【Loon 配置】====
[MITM]
hostname = ccsp-egmas.sf-express.com
[Script]
http-request ^https:\/\/ccsp-egmas.sf-express.com\/cx-app-member\/member\/app\/user\/universalSign script-path=https://raw.githubusercontent.com/ways0210/Loon-js/master/js/sfexpress/sf.js, requires-body=true, tag=Rewrite: 顺丰速运
