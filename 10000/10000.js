/**
 * 中国电信套餐余量通知
 * 适用：Loon Cron 定时脚本
 * 抓取地址：https://e.dlife.cn/portal/web/index.html#/
 */


const COOKIE = $persistentStore.read("china_telecom_cookie") || "";

const URL_DETAIL = "https://e.dlife.cn/user/package_detail.do";
const URL_BALANCE = "https://e.dlife.cn/user/balance.do";

function requestJSON(url) {
  return new Promise((resolve, reject) => {
    $httpClient.get({
      url: url,
      timeout: 15000,
      headers: {
        "Cookie": COOKIE,
        "Referer": "https://e.dlife.cn/",
        "User-Agent": "Mozilla/5.0"
      }
    }, (error, response, data) => {
      if (error) return reject(error);
      if (!response || response.status !== 200) {
        return reject(new Error("HTTP状态异常：" +
          (response ? response.status : "无响应")));
      }
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error("接口返回非JSON数据，可能登录失效"));
      }
    });
  });
}

function formatFlow(number) {
  let n = Number(number) / 1024;
  if (n < 1024) return n.toFixed(2) + " MB";
  return (n / 1024).toFixed(2) + " GB";
}

async function main() {
  try {
    if (!COOKIE || COOKIE.includes("这里粘贴")) {
      throw new Error("请先填写电信Cookie");
    }

    const detail = await requestJSON(URL_DETAIL);

    let flow = {
      balanceAmount: 0,
      ratableAmount: 0
    };

    let voice = {
      balanceAmount: 0,
      ratableAmount: 0
    };

    if (!detail.items || !Array.isArray(detail.items)) {
      throw new Error("套餐数据异常，可能Cookie失效");
    }

    detail.items.forEach(group => {
      (group.items || []).forEach(item => {
        if (
          String(item.unitTypeId) === "3" &&
          String(item.balanceAmount) !== "999999999999"
        ) {
          flow.balanceAmount += Number(item.balanceAmount) || 0;
          flow.ratableAmount += Number(item.ratableAmount) || 0;
        }

        if (String(item.unitTypeId) === "1") {
          voice.balanceAmount += Number(item.balanceAmount) || 0;
          voice.ratableAmount += Number(item.ratableAmount) || 0;
        }
      });
    });

    const balance = await requestJSON(URL_BALANCE);

    const fee = (
      Number(balance.totalBalanceAvailable) / 100
    ).toFixed(2);

    const flowText = formatFlow(flow.balanceAmount);
    const voiceText = Number(voice.balanceAmount).toFixed(0);

    const flowPercent = flow.ratableAmount > 0
      ? (flow.balanceAmount / flow.ratableAmount * 100).toFixed(1)
      : "--";

    const voicePercent = voice.ratableAmount > 0
      ? (voice.balanceAmount / voice.ratableAmount * 100).toFixed(1)
      : "--";

    const content =
      " 📱话费:" + fee + "元" +
			"   📶流量:" + flowText +"\n"+
			" 📞语音:" + voiceText + "分钟" +
      " 📊流量比:" + flowPercent + "%\n" +
      " 🕒更新时间:" + new Date().toLocaleString();

    $notification.post(
      "中国电信套餐余量查询",
      "查询成功",
      content
    );

    console.log(content);

  } catch (e) {
    console.log("电信查询失败：" + e);
    $notification.post(
      "中国电信查询失败",
      "请检查Cookie或接口",
      String(e)
    );
  } finally {
    $done();
  }
}

main();