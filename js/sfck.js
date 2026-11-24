#!name=顺丰Cookie抓取
#!desc=使用方法：打开顺丰APP →我 →（左上角）积分
#App链接=
#!author=ways0210[https://github.com/ways0210]
#!tag=
#!system=
#!system_version=
#!loon_version=3.5.1(998)
#!homepage=https://github.com/ways0210/Loon-Js/tree/master/js
#!icon=https://cdn.jsdelivr.net/gh/ways0210/Loon-Js@master/IP-jc/SSID.png
#!date=2026-11-25 02:55
  
[Script]
http-request ^https:\/\/ccsp-egmas.sf-express.com\/cx-app-member\/member\/app\/user\/universalSign script-path=https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/cookie/sfexpress.cookie.js, requires-body=true, tag=Rewrite: 顺丰速运


[MITM]
hostname = ccsp-egmas.sf-express.com