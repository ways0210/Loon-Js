#!name=中国移动Cookie获取
#!desc=定时脚本的订阅地址：https://raw.githubusercontent.com/ways0210/Loon-Js/master/10086/10086.js
#!author=ways0210

[Script]
request if ${url} ~= /^https?:\/\/client\.app\.coc\.10086\.cn\/biz-orange\/[LD]N\/(uam(onekey|randcode)login|realPersonAuthentication)\/autoLogin/i then script("https://github.com/ChinaTelecomOperators/ChinaMobile/releases/download/Prerelease-Alpha/10086.js") with tag="10086", timeout=60, requires_body=true

[MITM]
hostname = client.app.coc.10086.cn

