// 独立链路出口检测，无依赖，Loon 通用
const url = "https://api.ipify.org?format=json";

$httpClient.get(url, (error, response, body) => {
  if (error) {
    $notification.post("代理链路检测", "请求失败", error.message);
    return;
  }
  try {
    const data = JSON.parse(body);
    $notification.post("代理链路检测", "出口IP：" + data.ip, "");
  } catch (e) {
    $notification.post("代理链路检测", "返回解析失败", body);
  }
});
