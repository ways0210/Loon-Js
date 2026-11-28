
/**
 * 公历节日 + 农历节日 + 二十四节气提醒
 * 运行环境：Loon
 * 建议每天 08:00 运行
 * 二十四节气到 2035年都是准确的 公历农历纯运算
 * 如果有缺失可以将脚本构建到本地按格式添加修改 
 * 只有当天有节气或节日才会有通知提醒
 * 其余时间静默不通知 
 * 纯本地运行无网络请求、无 Cookie
 */

// ==========================================
// 0. 测试设置
// ==========================================

// 首次测试可以改成 true
// 会额外推送一条日期识别测试通知
// 测试完成后务必改回 false
//==================== 测试设置 ====================

// true：开启测试模式
// false：正式运行模式
const TEST_MODE = false;

// 下面引号内指定测试日期
// 格式：年-月-日
// 例如：2026-11-28
// 测试完记得把引号里日期删掉
// 留空则测试手机当天日期
const TEST_DATE = "";

//================================================

// ==========================================
// 1. 公历节日
// ==========================================

const solarHolidays = {
  "1-1": ["元旦", "新年新气象，祝你新年快乐！🎉"],
  "2-14": ["情人节", "愿生活充满爱与美好！❤️"],
  "3-8": ["妇女节", "祝所有女性节日快乐！🌹"],
  "3-12": ["植树节", "植一棵树，添一份绿意！🌳"],
  "3-15": ["消费者权益日", "关注消费权益，维护合法权益！"],
  "4-1": ["愚人节", "今天记得保持清醒，别被捉弄了！😄"],
  "4-22": ["世界地球日", "保护地球，从身边的小事做起！🌍"],
  "5-1": ["劳动节", "致敬每一位辛勤劳动的人！"],
  "5-4": ["青年节", "青春正当时，奋斗正当年！"],
  "5-12": ["国际护士节", "向每一位白衣天使致敬！"],
  "5-20": ["网络情人节", "520，愿爱与美好常伴左右！❤️"],
  "6-1": ["儿童节", "愿每一颗童心都能快乐成长！🎈"],
  "6-5": ["世界环境日", "爱护环境，守护绿色家园！🌱"],
  "7-1": ["建党节", "七一建党节。🇨🇳"],
  "8-1": ["建军节", "向人民子弟兵致敬！"],
  "9-10": ["教师节", "祝老师们节日快乐！🌹"],
	"9-18": ["九一八事变", "勿忘国耻，铭记于心。❤️‍🔥"],
  "10-1": ["国庆节", "祝祖国繁荣昌盛，国泰民安！🇨🇳"],
  "10-31": ["万圣节", "祝你度过一个有趣的万圣节！🎃"],
  "11-11": ["双十一", "理性消费，开心生活！"],
  "12-24": ["平安夜", "平安喜乐，万事顺遂！🎄"],
  "12-25": ["圣诞节", "圣诞快乐，愿美好如期而至！🎅"]
};

// ==========================================
// 2. 农历节日
// 键值为正常农历月份-日期
// 闰月不触发
// ==========================================

const lunarHolidays = {
  "1-1": ["春节", "新春快乐，万事如意！🧧"],
  "1-15": ["元宵节", "花好月圆，元宵快乐！🏮"],
  "2-2": ["龙抬头", "二月二龙抬头，愿一年顺顺利利！🐉"],
  "5-5": ["端午节", "端午安康！愿平安健康！"],
  "7-7": ["七夕节", "愿有情人终成眷属！❤️"],
  "7-15": ["中元节", "慎终追远，心怀敬意。"],
  "8-15": ["中秋节", "月圆人团圆，中秋快乐！🌕"],
  "9-9": ["重阳节", "岁岁重阳，平安健康！"],
  "12-8": ["腊八节", "腊八安康，岁末吉祥！"],
  "12-23": ["北方小年", "小年快乐，迎接新春！"],
  "12-24": ["南方小年", "小年快乐，辞旧迎新！"],
  "12-30": ["除夕", "辞旧迎新，阖家团圆！🧨"]
};

// ==========================================
// 3. 二十四节气
// ==========================================

const solarTermNames = [
  "小寒", "大寒", "立春", "雨水",
  "惊蛰", "春分", "清明", "谷雨",
  "立夏", "小满", "芒种", "夏至",
  "小暑", "大暑", "立秋", "处暑",
  "白露", "秋分", "寒露", "霜降",
  "立冬", "小雪", "大雪", "冬至"
];

const solarTermMessages = {
  "小寒": "天气渐寒，注意保暖。❄️",
  "大寒": "一年中寒冷的时节，静待春来。",
  "立春": "春回大地，万物复苏。🌱",
  "雨水": "春雨润物，万物生长。🌧️",
  "惊蛰": "春雷始鸣，万物萌动。",
  "春分": "昼夜平分，春意盎然。🌸",
  "清明": "气清景明，万物皆显。",
  "谷雨": "雨生百谷，春将尽。",
  "立夏": "夏季开始，万物繁茂。☀️",
  "小满": "小满未满，恰到好处。",
  "芒种": "有芒之谷可播种，农事正忙。",
  "夏至": "白昼最长，盛夏将至。☀️",
  "小暑": "天气渐热，注意防暑。",
  "大暑": "炎热时节，注意防暑降温。",
  "立秋": "秋季开始，暑气渐消。🍂",
  "处暑": "暑气渐退，秋意渐浓。",
  "白露": "天气转凉，露凝而白。",
  "秋分": "昼夜平分，秋色正好。🍁",
  "寒露": "露水渐寒，注意添衣。",
  "霜降": "天气渐冷，初霜将至。",
  "立冬": "冬季开始，万物收藏。❄️",
  "小雪": "天气渐寒，可能降雪。",
  "大雪": "寒冬渐深，注意保暖。",
  "冬至": "冬至阳生，团圆安康。"
};

// ==========================================
// 4. 节气日期表
// 2026—2035年优先使用固定日期表
// ==========================================

const termTable = {
  2026:[[1,5],[1,20],[2,4],[2,19],[3,6],[3,21],[4,5],[4,20],[5,6],[5,21],[6,6],[6,21],[7,7],[7,23],[8,8],[8,23],[9,8],[9,23],[10,8],[10,23],[11,7],[11,22],[12,7],[12,22]],
  2027:[[1,5],[1,20],[2,4],[2,19],[3,5],[3,21],[4,5],[4,20],[5,6],[5,21],[6,6],[6,21],[7,7],[7,23],[8,8],[8,23],[9,8],[9,23],[10,8],[10,23],[11,7],[11,22],[12,7],[12,22]],
  2028:[[1,6],[1,21],[2,4],[2,19],[3,5],[3,20],[4,4],[4,19],[5,5],[5,20],[6,5],[6,21],[7,6],[7,22],[8,7],[8,22],[9,7],[9,22],[10,8],[10,23],[11,7],[11,22],[12,7],[12,21]],
  2029:[[1,5],[1,20],[2,3],[2,18],[3,5],[3,20],[4,4],[4,20],[5,5],[5,21],[6,5],[6,21],[7,6],[7,22],[8,7],[8,23],[9,7],[9,23],[10,8],[10,23],[11,7],[11,22],[12,6],[12,21]],
  2030:[[1,5],[1,20],[2,4],[2,19],[3,5],[3,21],[4,5],[4,20],[5,6],[5,21],[6,6],[6,21],[7,7],[7,23],[8,8],[8,23],[9,8],[9,23],[10,8],[10,23],[11,7],[11,22],[12,7],[12,22]],
  2031:[[1,5],[1,20],[2,4],[2,19],[3,6],[3,21],[4,5],[4,20],[5,6],[5,21],[6,6],[6,21],[7,7],[7,23],[8,8],[8,23],[9,8],[9,23],[10,8],[10,23],[11,7],[11,22],[12,7],[12,22]],
  2032:[[1,6],[1,21],[2,4],[2,19],[3,5],[3,20],[4,4],[4,19],[5,5],[5,20],[6,5],[6,21],[7,6],[7,22],[8,7],[8,22],[9,7],[9,22],[10,8],[10,23],[11,7],[11,22],[12,7],[12,21]],
  2033:[[1,5],[1,20],[2,3],[2,18],[3,5],[3,20],[4,4],[4,19],[5,5],[5,21],[6,5],[6,21],[7,6],[7,22],[8,7],[8,23],[9,7],[9,23],[10,8],[10,23],[11,7],[11,22],[12,6],[12,21]],
  2034:[[1,5],[1,20],[2,4],[2,19],[3,5],[3,21],[4,5],[4,20],[5,6],[5,21],[6,6],[6,21],[7,7],[7,23],[8,8],[8,23],[9,8],[9,23],[10,8],[10,23],[11,7],[11,22],[12,7],[12,22]],
  2035:[[1,5],[1,20],[2,4],[2,19],[3,6],[3,21],[4,5],[4,20],[5,6],[5,21],[6,6],[6,21],[7,7],[7,23],[8,8],[8,23],[9,8],[9,23],[10,8],[10,23],[11,7],[11,22],[12,7],[12,22]]
};

// ==========================================
// 5. 节气日期计算
// ==========================================

function getSolarTermDate(year, index) {
  if (termTable[year]) {
    const item = termTable[year][index];
    return new Date(year, item[0] - 1, item[1]);
  }

  const offsets = [
    0,15.218,30.444,45.673,60.909,76.149,
    91.395,106.642,121.889,137.139,152.387,
    167.633,182.882,198.126,213.373,228.618,
    243.864,259.108,274.355,289.601,304.847,
    320.093,335.341,350.586
  ];

  const dayMs = 86400000;
  const base = Date.UTC(2000, 0, 6, 5, 29);
  const shift = (
    Date.UTC(year, 0, 1) -
    Date.UTC(2000, 0, 1)
  ) / dayMs;

  const raw = new Date(
    base + (shift + offsets[index]) * dayMs
  );

  return new Date(
    raw.getUTCFullYear(),
    raw.getUTCMonth(),
    raw.getUTCDate()
  );
}

function getTodaySolarTerm(now) {
  const year = now.getFullYear();

  for (let i = 0; i < 24; i++) {
    const d = getSolarTermDate(year, i);

    if (
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    ) {
      return solarTermNames[i];
    }
  }

  return null;
}

// ==========================================
// 6. 农历日期转换
// 使用 Intl 中国农历日历
// ==========================================

function getLunarDate(date) {
  if (
    typeof Intl === "undefined" ||
    typeof Intl.DateTimeFormat !== "function"
  ) {
    throw new Error("当前 JS 环境不支持 Intl 农历日历");
  }

  const formatter = new Intl.DateTimeFormat(
    "en-u-ca-chinese-nu-latn",
    {
      year: "numeric",
      month: "numeric",
      day: "numeric"
    }
  );

  if (typeof formatter.formatToParts !== "function") {
    throw new Error("当前环境不支持 formatToParts");
  }

  const parts = formatter.formatToParts(date);

  const monthPart = parts.find(p => p.type === "month");
  const dayPart = parts.find(p => p.type === "day");

  if (!monthPart || !dayPart) {
    throw new Error("无法取得农历月日");
  }

  const monthText = monthPart.value;
  const dayText = dayPart.value;

  const monthMatch = monthText.match(/\d+/);
  const dayMatch = dayText.match(/\d+/);

  if (!monthMatch || !dayMatch) {
    throw new Error(
      "农历日期解析失败：" + monthText + "/" + dayText
    );
  }

  const month = parseInt(monthMatch[0], 10);
  const day = parseInt(dayMatch[0], 10);

  // Intl 对闰月通常使用 bis 标记
  const isLeap = /bis|闰|leap/i.test(monthText);

  if (
    month < 1 || month > 12 ||
    day < 1 || day > 30
  ) {
    throw new Error("农历日期超出有效范围");
  }

  return {
    month,
    day,
    isLeap,
    monthText,
    dayText
  };
}


// ==========================================
// 7. 主程序
// ==========================================

(async () => {
  try {

    // 测试日期
    function getTestDate(dateString) {
      if (!dateString) return new Date();

      const match = dateString.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/
      );

      if (!match) {
        throw new Error(
          "测试日期格式错误，请使用 YYYY-MM-DD"
        );
      }

      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        12, 0, 0
      );
    }

    const now = TEST_MODE
      ? getTestDate(TEST_DATE)
      : new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const solarKey = `${month}-${day}`;

    // 公历节日
    const solarHoliday = solarHolidays[solarKey];

    // 二十四节气
    const solarTerm = getTodaySolarTerm(now);

    // 农历日期
    let lunar = null;
    let lunarError = "";

    try {
      lunar = getLunarDate(now);
    } catch (e) {
      lunarError = e.message;
      console.log("农历转换失败：" + lunarError);
    }

    // 农历节日：只允许正常月份触发
    let lunarHoliday = null;

    if (lunar && !lunar.isLeap) {
      const lunarKey = `${lunar.month}-${lunar.day}`;

      lunarHoliday = lunarHolidays[lunarKey] || null;

      // 动态判断除夕
      const tomorrow = new Date(
        year,
        month - 1,
        day + 1,
        12, 0, 0
      );

      const tomorrowLunar = getLunarDate(tomorrow);

      if (
        lunar.month === 12 &&
        tomorrowLunar.month === 1 &&
        tomorrowLunar.day === 1 &&
        !tomorrowLunar.isLeap
      ) {
        lunarHoliday = [
          "除夕",
          "辞旧迎新，阖家团圆！🧨"
        ];
      }
    }

    // 中文农历月份
    const lunarMonthNames = [
      "正月", "二月", "三月", "四月",
      "五月", "六月", "七月", "八月",
      "九月", "十月", "冬月", "腊月"
    ];

    // 中文农历日期
    const lunarDayNames = [
      "初一", "初二", "初三", "初四", "初五",
      "初六", "初七", "初八", "初九", "初十",
      "十一", "十二", "十三", "十四", "十五",
      "十六", "十七", "十八", "十九", "二十",
      "廿一", "廿二", "廿三", "廿四", "廿五",
      "廿六", "廿七", "廿八", "廿九", "三十"
    ];

    // 公历日期
    const solarDateText =
      `${year}年${month}月${day}日`;

    // 农历日期
    const lunarDateText = lunar
      ? `${lunar.isLeap ? "闰" : ""}` +
        `${lunarMonthNames[lunar.month - 1]}` +
        `${lunarDayNames[lunar.day - 1]}`
      : "农历转换失败";

    // ======================================
    // 整理当天所有节日和节气
    // ======================================

    const eventLines = [];
    let firstMessage = "";
    let messageType = "";

    // 公历节日优先级第一
    if (solarHoliday) {
      eventLines.push(
        `公历节日：${solarHoliday[0]}`
      );

      if (!firstMessage) {
        firstMessage = solarHoliday[1];
        messageType = "祝福";
      }
    }

    // 农历节日优先级第二
    if (lunarHoliday) {
      eventLines.push(
        `农历节日：${lunarHoliday[0]}`
      );

      if (!firstMessage) {
        firstMessage = lunarHoliday[1];
        messageType = "祝福";
      }
    }

    // 二十四节气优先级第三
    if (solarTerm) {
      eventLines.push(
        `二十四节气：${solarTerm}`
      );

      if (!firstMessage) {
        firstMessage =
          solarTermMessages[solarTerm] ||
          "今天是二十四节气之一。";

        messageType = "提醒";
      }
    }

    // ======================================
    // 测试模式
    // 只有测试时才会显示“节日节气识别测试”
		// 非测试模式正常显示 ======================================

    if (TEST_MODE) {

      console.log("公历日期：" + solarDateText);
      console.log("农历日期：" + lunarDateText);

      console.log(
        eventLines.length
          ? eventLines.join("\n")
          : "当天没有节日或节气"
      );

      console.log(
        firstMessage
          ? messageType + "：" + firstMessage
          : "当天没有祝福或提醒内容"
      );

      $notification.post(
        "节日节气识别测试",
        "日期识别结果",
        `今天公历：${solarDateText}  农历：${lunarDateText}\n` +
        (eventLines.length
          ? eventLines.join("\n") + "\n"
          : "当天没有节日或节气\n") +
        (firstMessage
          ? `${messageType}：${firstMessage}`
          : "")
      );

      $done();
      return;
    }

    // ======================================
    // 正式模式
    // ======================================

    // 普通日期不提醒
    if (eventLines.length === 0) {
      console.log("今天没有节日或节气，不发送通知");
      $done();
      return;
    }

    // 通知正文
    const body =
      `今天公历：${solarDateText}  农历：${lunarDateText}\n` +
      eventLines.join("\n") +
      `\n${messageType}：${firstMessage}`;

    // 发送通知
    $notification.post(
      "🎁节日·节气☁️",
      "",
      body
    );

    console.log("通知发送成功：");
    console.log(body);

  } catch (e) {
    console.log("脚本执行失败：" + e);
  }

  $done();

})();
