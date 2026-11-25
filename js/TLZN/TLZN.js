// 台铃智能 App 自动签到（BoxJS版）

// BoxJS 变量读取，支持 @tailing.ck 格式
function getBoxData(key) {
  const match = key.match(/^@([^.]+)\.(.+)$/);

  if (match) {
    const rootKey = match[1];
    const fieldPath = match[2];

    // 读取 BoxJS 根数据
    const raw = $persistentStore.read(rootKey);

    if (raw) {
      try {
        const obj = JSON.parse(raw);
        const value = fieldPath.split(".").reduce(
          (data, field) => data == null ? undefined : data[field],
          obj
        );

        if (value !== undefined && value !== null) {
          return String(value);
        }
      } catch (e) {
        console.log("BoxJS 数据解析失败：" + e);
      }
    }
  }

  // 兼容普通独立变量
  return $persistentStore.read(key) || "";
}

const ck = getBoxData("@tailing.ck").trim();

if (!ck) {
  $notification.post(
    "台铃智能App",
    "❌ Cookie读取失败",
    "请检查BoxJS中是否填写了 @tailing.ck"
  );
  $done();
} else {

  const url = "https://www.tailgdd.com/v1/api/shop/app/integral/sign/saveIntegralSignIn";

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
