
// ==========================================
// 台铃智能 App 自动签到
// 适用：Loon 3.5.3 + BoxJS
// BoxJS变量：@tailing.ck
// ==========================================

// 1. 从 BoxJS 读取 Cookie
let ck = "";

try {
  const raw = $persistentStore.read("tailing");

  if (raw) {
    const obj = JSON.parse(raw);
    ck = String(obj.ck || "").trim();
  }
} catch (e) {
  console.log("BoxJS读取失败：" + e);
}

// 2. 检查 Cookie
if (!ck) {
  $notification.post(
    "台铃智能App",
    "❌ Cookie读取失败",
    "请检查BoxJS中是否填写了台铃CK"
  );
  $done();
} else {

  // 3. 签到接口
  const url = "https://www.tailgdd.com/v1/api/shop/app/integral/sign/saveIntegralSignIn";

  // 4. 请求头
  const headers = {
    "X-Requested-With": "XMLHttpRequest",
    "Connection": "keep-alive",
    "Content-Type": "application/json;charset=UTF-8",
    "Sec-Fetch-Site": "same-origin",
    "Origin": "https://www.tailgdd.com",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.15 (KHTML, like Gecko) Mobile/15E148",
    "Sec-Fetch-Mode": "cors",
    "Cookie": ck,
    "Referer": "https://www.tailgdd.com/travel/tailg-shop-h5/",
    "Accept-Language": "zh-CN,zh-Hans;q=0.9",
    "Accept": "application/json, text/plain, */*"
  };

  // 5. 执行签到
  $httpClient.post({
    url: url,
    headers: headers,
    body: "{}"
  }, (error, response, data) => {

    if (error) {
      $notification.post(
        "台铃智能App",
        "❌ 请求异常",
        String(error)
      );

    } else {

      try {
        const res = JSON.parse(data);

        if (res.code === 100) {

          $notification.post(
            "台铃智能App",
            "❌ 请勿重复签到"
          );

        } else if (res.code === 0) {

          $notification.post(
            "台铃智能App",
            "✅ 签到成功"
          );

        } else {

          $notification.post(
            "台铃智能App",
            "提示：" + (res.msg || "未知返回")
          );

        }

      } catch (e) {

        $notification.post(
          "台铃智能App",
          "❌ 返回不是JSON",
          "可能是Cookie失效或接口返回异常"
        );

      }
    }

    $done();
  });
}
