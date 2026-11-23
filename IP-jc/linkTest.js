// 优先 ipx.al，失败切备用，Loon弹窗版 $message
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
    const loc = typeof data.location === "object" ? JSON.stringify(data.location) : data.location;
    const type = typeof data.type === "object" ? JSON.stringify(data.type) : data.type;
    const msg = `IP：${data.ip}\n地区：${loc}\nASN：${data.asn}\n类型：${type}`;
    $message("代理链路检测 - ipx.al", msg);
    return;
  }
  check(backup, (data2, err2) => {
    if (data2) {
      const msg = `IP：${data2.ip}\n地区：${data2.city}, ${data2.region}, ${data2.country_name}`;
      $message("代理链路检测 - 备用接口", msg);
    } else {
      $message("代理链路检测 - 失败", "两个接口全部失败\n" + (err?.message || "") + " | " + (err2?.message || ""));
    }
  });
});
