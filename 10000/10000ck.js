
/**
 * 中国电信自动获取登录地址及 SSON Cookie
 * 适用：Loon 3.5.3
 *
 * 请求阶段：获取登录地址
 * 响应阶段：获取 Set-Cookie 中的 SSON
 */

const TARGET = "https://e.dlife.cn/user/loginMiddle";

const LOGIN_URL_KEY = "china_telecom_loginUrl";
const COOKIE_KEY = "china_telecom_cookie";

function finish() {
  $done({});
}

function notify(title, subtitle, content) {
  $notification.post(title, subtitle, content);
}

// ==============================
// 响应阶段：自动提取 SSON
// ==============================

if (typeof $response !== "undefined" && $response) {

  const headers = $response.headers || {};
  let setCookie = "";

  Object.keys(headers).forEach(key => {
    if (key.toLowerCase() === "set-cookie") {
      const value = headers[key];
      setCookie = Array.isArray(value)
        ? value.join("\n")
        : String(value || "");
    }
  });

  const match = setCookie.match(/SSON=([^;,\s]+)/i);

  if (match && match[1]) {

    const cookie = "SSON=" + match[1];

    const saved = $persistentStore.write(
      cookie,
      COOKIE_KEY
    );

    if (saved) {
      console.log("电信 SSON Cookie 自动更新成功");

      notify(
        "中国电信",
        "Cookie 自动更新成功",
        "最新 SSON 已保存，可以进行套餐查询"
      );

    } else {
      console.log("Cookie 保存失败");

      notify(
        "中国电信",
        "Cookie 保存失败",
        "请检查 Loon 持久化存储"
      );
    }

  } else {

    console.log("响应头没有找到 SSON");

    notify(
      "中国电信",
      "Cookie 获取失败",
      "响应头中没有找到 SSON"
    );
  }

  finish();

// ==============================
// 请求阶段：保留原登录地址抓取
// ==============================

} else if (typeof $request !== "undefined" && $request) {

  if ($request.url.indexOf(TARGET) !== -1) {

    const match = $request.url.match(/(http.+)&sign/i);

    if (match && match[1]) {

      $persistentStore.write(
        match[1],
        LOGIN_URL_KEY
      );

      console.log("电信登录地址获取成功");

      notify(
        "中国电信",
        "登录地址获取成功",
        "已自动保存登录地址"
      );

    } else {
      console.log("登录地址匹配失败");
    }
  }

  finish();

} else {

  console.log("未识别请求或响应环境");
  finish();
}
