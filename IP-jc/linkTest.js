
// ======================================
// Loon 代理出口 IP 检测
// 优先 ipx.al，失败自动切换 ipapi.co
// 适用于 Loon 定时脚本 / 手动运行
// ======================================

var primary = "https://ipx.al/json";
var backup = "https://ipapi.co/json/";

// 发送 Loon 系统通知并结束脚本
function notify(title, content) {
  $notification.post(title, "", content);
  $done();
}

// 请求并解析 JSON
function check(url, callback) {
  $httpClient.get(url, function (err, resp, body) {

    if (err) {
      return callback(null, "请求失败：" + String(err));
    }

    if (!resp || resp.status < 200 || resp.status >= 300) {
      return callback(
        null,
        "HTTP 状态异常：" + (resp ? resp.status : "未知")
      );
    }

    try {
      var data = JSON.parse(body);

      if (!data || !data.ip) {
        return callback(null, "接口没有返回有效 IP");
      }

      callback(data, null);

    } catch (e) {
      callback(null, "JSON 解析失败：" + String(e));
    }
  });
}

// 优先使用主接口
check(primary, function (data, err) {

  if (data) {

    var loc = data.location || "未知";
    var type = data.type || "未知";
    var asn = data.asn || "未知";

    if (typeof loc === "object") {
      loc = JSON.stringify(loc);
    }

    if (typeof type === "object") {
      type = JSON.stringify(type);
    }

    var msg =
      "IP：" + data.ip +
      "\n地区：" + loc +
      "\nASN：" + asn +
      "\n类型：" + type;

    notify("代理链路检测 - ipx.al", msg);
    return;
  }

  // 主接口失败，切换备用接口
  check(backup, function (data2, err2) {

    if (data2) {

      var msg =
        "IP：" + data2.ip +
        "\n地区：" +
        (data2.city || "未知") + ", " +
        (data2.region || "未知") + ", " +
        (data2.country_name || "未知") +
        "\nASN：" + (data2.asn || "未知") +
        "\n运营商：" + (data2.org || "未知");

      notify("代理链路检测 - 备用接口", msg);

    } else {

      notify(
        "代理链路检测 - 失败",
        "两个接口全部失败\n\n主接口：" +
        err +
        "\n\n备用接口：" +
        err2
      );
    }
  });
});
