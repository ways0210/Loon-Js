#!name=10086
#!desc=10086

[Script]
request if ${url} ~= /^https?:\/\/client\.app\.coc\.10086\.cn\/biz-orange\/[LD]N\/(uam(onekey|randcode)login|realPersonAuthentication)\/autoLogin/i then script("https://github.com/ChinaTelecomOperators/ChinaMobile/releases/download/Prerelease-Alpha/10086.js") with tag="10086", timeout=60, requires_body=true

[MITM]
hostname = client.app.coc.10086.cn

