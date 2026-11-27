
const KEY = "SGCC_BRIDGE_DATA";

try {
  const raw = $request.body;
  const data = typeof raw === "string"
    ? JSON.parse(raw)
    : null;

  if (!data || data.source !== "Scriptable-SGCC") {
    throw new Error("不是有效的国网数据");
  }

  if (!data.data || typeof data.data.balance === "undefined") {
    throw new Error("缺少电费数据");
  }

  const saved = $persistentStore.write(
    JSON.stringify(data),
    KEY
  );

  if (!saved) {
    throw new Error("Loon保存数据失败");
  }

  console.log("国网数据交接成功");
  console.log("余额：" + data.data.balance);
  console.log("年度电量：" + data.data.yearPq);
  console.log("年度电费：" + data.data.yearAmount);
  console.log("数据时间：" + data.time);

  $done({
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        ok: true,
        received: true
      })
    }
  });

} catch (e) {
  console.log("国网数据接收失败：" + e.message);

  $done({
    response: {
      status: 400,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        ok: false,
        error: e.message
      })
    }
  });
}
