// 上金所金价查询 - Loon定时通知版（带官方更新时间）
const url = `https://api.jijinhao.com/quoteCenter/realTime.htm?codes=JO_71&_=${Date.now()}`

const opts = {
  url: url,
  headers: {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://m.cngold.org/"
  }
}

// 时间格式化
function formatTime(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

$httpClient.get(opts, (error, response, data) => {
  if (error) {
    console.log("金价查询失败: " + error)
    $done()
    return
  }

  try {
    const match = data.match(/var\s+quote_json\s*=\s*(\{[\s\S]*\});?/)
    if (!match) {
      console.log("金价数据解析失败")
      $done()
      return
    }

    const raw = JSON.parse(match[1])
    const info = raw["JO_71"]
    if (!info) {
      $done()
      return
    }

    const price = info.q63.toFixed(2)
    const rise = (info.q70 >= 0 ? "+" : "") + info.q70.toFixed(2)
    const ratio = (info.q80 >= 0 ? "+" : "") + info.q80.toFixed(2) + "%"
    const status = info.status === 100 ? "开盘中" : info.status === 110 ? "休市中" : "已收盘"
    const updateTime = formatTime(info.time)

    // 推送系统通知
    $notification.post(
      "上金所实时金价",
      `最新价格：${price} 元/克（RMB）💰`,
      `涨跌：${rise} (${ratio}) | 状态：${status}\n更新时间：${updateTime}`
    )

  } catch (e) {
    console.log("解析出错: " + e.message)
  }

  $done()
})
