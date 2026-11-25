#!name=中国移动Cookie获取
#!desc=定时脚本的订阅地址：https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/10086/10086.js
#!author=ways0210
#!loon_version=3.5.3
#!icon=https://cdn.jsdelivr.net/gh/ways0210/Loon-Js@master/icon/10086.PNG
  
[Script]
request if ${url} ~= /^https?:\/\/client\.app\.coc\.10086\.cn\/biz-orange\/[LD]N\/(uam(onekey|randcode)login|realPersonAuthentication)\/autoLogin/i then script("https://github.com/ways0210/ChinaMobile/releases/download/Prerelease-Alpha/10086.js") with tag="10086", timeout=60, requires_body=true

[MITM]
hostname = client.app.coc.10086.cn
