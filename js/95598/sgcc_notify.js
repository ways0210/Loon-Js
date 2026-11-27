/**
 * 网上国网 - 用电信息通知
 * 数据来源：Scriptable 小组件 → sgcc_bridge.js
 * 运行环境：Loon
 */

const KEY = "SGCC_BRIDGE_DATA";

(() => {
  try {
    // 读取 Scriptable 交接的数据
    const raw = $persistentStore.read(KEY);

    if (!raw) {
      throw new Error("没有找到国网数据，请先运行一次 Scriptable 小组件");
    }

    const result = JSON.parse(raw);
    const data = result.data;

    if (!data) {
      throw new Error("国网数据格式不正确");
    }

    // 金额格式
    const money = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num.toFixed(2) : "0.00";
    };

    // 电量格式
    const quantity = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? String(num) : "0";
    };

    // 判断账户状态
    const balance = Number(data.balance);
    const isArrears = data.arrearsOfFees || balance < 0;
    const status = isArrears ? "欠费" : "正常";

    // 更新时间
    const date = new Date(result.time);

    if (isNaN(date.getTime())) {
      throw new Error("数据更新时间无效");
    }

    const pad = (n) => String(n).padStart(2, "0");

    const updateTime =
      date.getFullYear() + "年" +
      (date.getMonth() + 1) + "月" +
      date.getDate() + "日 " +
      pad(date.getHours()) + ":" +
      pad(date.getMinutes()) + ":" +
      pad(date.getSeconds());

    // 整理通知内容
    const body = [
      `账户余额：${money(data.balance)} 元  账户状态：${status}`,
      `上期用电：${quantity(data.lastPq)}度  上期电费：${money(data.lastAmount)}元`,
      `年度用电：${quantity(data.yearPq)} 度  年度电费：${money(data.yearAmount)}元`,
      `更新时间：${updateTime}`
    ].join("\n");

    // 发送通知
    $notification.post(
      "🪙网上国网 电费信息💌 ",
      "",
      body
    );

    console.log("网上国网通知发送成功");
    console.log(body);

  } catch (e) {
    console.log("网上国网通知失败：" + e.message);

    $notification.post(
      "网上国网",
      "用电信息通知失败",
      e.message
    );
  }
})();