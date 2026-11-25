
// ==========================================
// 台铃 Authorization 自动抓取
// Loon 3.5.3
// 保存变量：tailing.auth
// ==========================================

try {
  if (typeof $request === "undefined" || !$request) {
    console.log("未获取到请求对象");
    $done({});
  } else {
    const headers = $request.headers || {};

    const auth = headers.Authorization ||
                 headers.authorization ||
                 "";

    if (typeof auth === "string" && auth.length > 100) {

      const result = $persistentStore.write(
        auth.trim(),
        "tailing.auth"
      );

      if (result) {
        console.log("台铃 Authorization 保存成功");
        $notification.post(
          "台铃智能App",
          "授权抓取成功",
          "Authorization 已保存到 tailing.auth"
        );
      } else {
        console.log("Authorization 保存失败");
      }

    } else {
      console.log("当前请求没有获取到有效 Authorization");
      console.log("请求头字段：" + Object.keys(headers).join(","));
    }

    $done({});
  }
} catch (e) {
  console.log("台铃抓取异常：" + String(e));
  $done({});
}
