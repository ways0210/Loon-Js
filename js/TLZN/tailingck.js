
/**
 * 台铃 Authorization 抓取诊断版
 * Loon 3.5.3
 * 保存变量：tailing.auth
 */

console.log("========== 台铃抓取开始 ==========");

try {
  if (typeof $request === "undefined") {
    console.log("错误：没有获取到$request");
  } else {
    console.log("请求URL：" + $request.url);

    const headers = $request.headers || {};
    const keys = Object.keys(headers);

    console.log("请求头字段：" + keys.join(","));

    let auth = "";

    for (const key of keys) {
      if (key.toLowerCase() === "authorization") {
        auth = headers[key];
        break;
      }
    }

    if (auth) {
      console.log("找到Authorization");
      console.log("Authorization长度：" + auth.length);

      const saved = $persistentStore.write(
        auth.trim(),
        "tailing.auth"
      );

      console.log("保存结果：" + saved);

      if (saved) {
        $notification.post(
          "台铃智能App",
          "Authorization抓取成功",
          "长度：" + auth.length
        );
      }
    } else {
      console.log("当前请求没有Authorization字段");
    }
  }
} catch (e) {
  console.log("异常：" + String(e));
}

console.log("========== 台铃抓取结束 ==========");

$done({});
