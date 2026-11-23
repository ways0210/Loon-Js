// 独立链路出口检测（带属地，Loon 通用，无 Sub-Store 依赖）
const url = "https://ipapi.co/json/";

$httpClient.get(url, (error, response, body) => {
  if (error) {
    $notification.post("代理链路检测", "请求失败", error.message);
    return;
  }
  try {
    const data = JSON.parse(body);
    const msg = `出口IP：${data.ip}\n地区：${data.city}, ${data.region}, ${data.country_name}`;
    $notification.post("代理链路检测", "✅ 检测成功", msg);
  } catch (e) {
    $notification.post("代理链路检测", "返回解析失败", body);
  }
});
