#!name=移动余量捕获
#!desc=中国移动套餐余量查询（仅适配Loon）。定时脚本订阅地址：https://cdn.jsdelivr.net/gh/ways0210/Script@master/10086/中国移动套餐余量查询.conf
#!author=ways0210

[Script]
request if ${url} ~= /^https?:\/\/client\.app\.coc\.10086\.cn\/biz-orange\/[LD]N\/(uam(onekey|randcode)login|realPersonAuthentication)\/autoLogin/i then script("https://github.com/ChinaTelecomOperators/ChinaMobile/releases/download/Prerelease-Alpha/10086.js") with tag="10086", timeout=60, requires_body=true

[MITM]
hostname = client.app.coc.10086.cn

