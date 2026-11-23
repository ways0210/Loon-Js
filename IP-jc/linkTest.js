// 双出口检测：优先 ipx.al，失败自动切换备用
const primary = "https://ipx.al/json";
const backup = "https://ipapi.co/json/";

function check(url, callback) {
  $httpClient.get(url, (err, resp, body) => {
    if (err) return callback(null, err);
    try {
      const j = JSON.parse(body);
      return callback(j, null);
    } catch {
      return callback(null, new Error("JSON parse error"));
    }
  });
}

check(primary, (data, err) => {
  if (data) {
    const msg = `IP：${data.ip}\n地区：${data.location}\nASN：${data.asn}\n类型：${data.type}`;
    $notification.post("代理链路检测", "✅ ipx.al", msg);
    return;
  }
  check(backup, (data2, err2) => {
    if (data2) {
      const msg = `IP：${data2.ip}\n地区：${data2.city}, ${data2.region}, ${data2.country_name}`;
      $notification.post("代理链路检测", "⚠️ 备用接口(ipapi)", msg);
    } else {
      $notification.post("代理链路检测", "❌ 两个接口全部失败", err?.message + " | " + err2?.message);
    }
  });
});
