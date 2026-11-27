[Script]
request if ${url} ~= /^http:\/\/sgcc-bridge\.invalid\/submit$/ && ${request.method} == "POST" then script("https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/95598/sgcc_bridge.js") with tag="国网数据接收", timeout=20, requires_body=true
