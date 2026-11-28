/**
 * ==========================================
 * 多平台每日热歌推送 V1.6
 * 运行环境：Loon 3.5.3
 *
 * 平台：
 * Apple Music / QQ音乐 / 网易云音乐
 * 抖音热歌榜 / 抖音飙升榜
 * 汽水音乐热歌榜 / 汽水音乐新歌榜
 * Spotify 全球周榜
 *
 * V1.5 更新：
 * 1. 正式接入 BoxJS 五项配置
 * 2. 支持多平台选择
 * 3. 支持每榜 3/5/10 首歌曲
 * 4. 支持抖音热歌榜/飙升榜选择
 * 5. 支持跨平台重复歌曲筛选
 * 6. 支持通知点击跳转榜单
 * 7. 无 BoxJS 配置时保留 V1.4 随机单平台模式
 * 8. 保留原有接口及备用接口
 * 9. 保留原有通知排版
 * ==========================================
 */


// ==========================================
// 1. 默认配置
// ==========================================

const DEFAULT_LIMIT = 10;

const DEFAULT_PLATFORMS = [
  "apple",
  "qq",
  "netease",
  "douyin",
  "qishui",
  "spotify"
];


// ==========================================
// 2. BoxJS 配置读取
// ==========================================

function readBoxJS(key) {

  try {

    return $persistentStore.read(key);

  } catch (error) {

    return null;

  }

}


function parseBoolean(value, defaultValue) {

  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const text = String(value).toLowerCase();

  return (
    text === "true" ||
    text === "1" ||
    text === "yes" ||
    text === "on"
  );

}


function parsePlatforms(value) {

  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  try {

    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }

  } catch (error) {}

  return String(value)
    .split(",")
    .map(function (item) {
      return item.trim();
    })
    .filter(Boolean);

}


function loadBoxJSConfig() {

  const rawPlatforms = readBoxJS("hotmusic_platforms");

  // 没有平台配置，视为没有接入 BoxJS
  if (
    rawPlatforms === null ||
    rawPlatforms === undefined ||
    rawPlatforms === ""
  ) {

    return {
      enabled: false
    };

  }

  const platforms = parsePlatforms(rawPlatforms);

  const validPlatforms = DEFAULT_PLATFORMS.filter(
    function (platform) {
      return platforms.indexOf(platform) !== -1;
    }
  );

  let limit = Number(
    readBoxJS("hotmusic_limit")
  );

  if ([3, 5, 10].indexOf(limit) === -1) {
    limit = DEFAULT_LIMIT;
  }

  let douyinType = String(
    readBoxJS("hotmusic_douyin_type") || "hot"
  );

  if (["hot", "soaring"].indexOf(douyinType) === -1) {
    douyinType = "hot";
  }

  return {

    enabled: true,

    platforms: validPlatforms,

    limit: limit,

    douyinType: douyinType,

    deduplicate: parseBoolean(
      readBoxJS("hotmusic_deduplicate"),
      false
    ),

    openUrl: parseBoolean(
      readBoxJS("hotmusic_open_url"),
      false
    )

  };

}


const BOX_CONFIG = loadBoxJSConfig();

let LIMIT = BOX_CONFIG.enabled
  ? BOX_CONFIG.limit
  : DEFAULT_LIMIT;

const CONFIG = {

  cleanVersionTag: true,

  checkDuplicate: true,

  showVersion: true,

  twoDigitRank: true,

  showFetchTime: true,

  showSeconds: true,

  deduplicate: BOX_CONFIG.enabled
    ? BOX_CONFIG.deduplicate
    : false,

  openUrl: BOX_CONFIG.enabled
    ? BOX_CONFIG.openUrl
    : false

};


// ==========================================
// 3. 全局统计
// ==========================================

const STATISTICS = {

  cleanedTitles: 0,

  duplicateSongs: 0,

  duplicateDetails: [],

  seenSongs: Object.create(null),

  filteredSongs: 0

};


// 抖音/汽水公共数据缓存
let XINGYUAN_BOARDS = null;

// ==========================================
// V1.6 日志输出缓存
// ==========================================

const ORIGINAL_CONSOLE_LOG = console.log.bind(console);

// 暂存日志，任务完成后统一输出
const BOARD_OUTPUTS = [];
const ERROR_OUTPUTS = [];
const DUPLICATE_OUTPUTS = [];

// 屏蔽过程日志，避免控制台杂乱
console.log = function () {};
// ==========================================
// 4. 公共请求函数
// ==========================================

function get(url, headers) {

  return new Promise(function (resolve, reject) {

    $httpClient.get({

      url: url,

      headers: headers || {}

    }, function (error, response, data) {

      if (error) {

        reject(new Error(String(error)));

        return;

      }

      if (!response) {

        reject(new Error("没有收到服务器响应"));

        return;

      }

      const status = response.status;

      if (status < 200 || status >= 300) {

        reject(new Error(
          "HTTP请求失败，状态码：" +
          status +
          "，返回内容：" +
          String(data || "").substring(0, 300)
        ));

        return;

      }

      resolve(data);

    });

  });

}


// ==========================================
// 5. JSON解析
// ==========================================

function parseJSON(data) {

  return JSON.parse(data);

}


// ==========================================
// 6. 时间格式化
// ==========================================

function formatDateTime(date) {

  function pad(value) {

    return String(value).padStart(2, "0");

  }

  const year = date.getFullYear();

  const month = pad(date.getMonth() + 1);

  const day = pad(date.getDate());

  const hour = pad(date.getHours());

  const minute = pad(date.getMinutes());

  const second = pad(date.getSeconds());

  if (CONFIG.showSeconds) {

    return (
      year + "-" +
      month + "-" +
      day + " " +
      hour + ":" +
      minute + ":" +
      second
    );

  }

  return (
    year + "-" +
    month + "-" +
    day + " " +
    hour + ":" +
    minute
  );

}


// ==========================================
// 7. 歌曲标题清理
// ==========================================

function cleanSongTitle(title) {

  if (!title) {
    return "未知歌曲";
  }

  let result = String(title);

  if (!CONFIG.cleanVersionTag) {
    return result;
  }

  const original = result;

  result = result.replace(
    /[（(][^）)]*(?:剪辑版|降速版|加速版|纯享版|纯音版|片段版|副歌版|DJ版)[^）)]*[）)]/gi,
    ""
  );

  result = result.replace(
    /[-—_ ]*(?:剪辑版|降速版|加速版|纯享版|纯音版|片段版|副歌版|DJ版)$/i,
    ""
  );

  result = result.replace(/\s{2,}/g, " ").trim();

  if (!result) {
    result = original;
  }

  if (result !== original) {
    STATISTICS.cleanedTitles++;
  }

  return result;

}


// ==========================================
// 8. 歌曲去重标准化
// ==========================================

function normalizeKey(value) {

  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。！？、,.!?;:：'"“”‘’（）()【】\[\]{}_\-—·]/g, "");

}


function cleanSongTitleForKey(title) {

  let result = String(title || "");

  result = result.replace(
    /[（(][^）)]*(?:剪辑版|降速版|加速版|纯享版|纯音版|片段版|副歌版|DJ版)[^）)]*[）)]/gi,
    ""
  );

  result = result.replace(
    /[-—_ ]*(?:剪辑版|降速版|加速版|纯享版|纯音版|片段版|副歌版|DJ版)$/i,
    ""
  );

  return result.trim();

}


// ==========================================
// 9. 重复歌曲识别
// 返回值：是否属于跨平台重复歌曲
// ==========================================

function checkDuplicate(song, platform, boardName) {

  if (!CONFIG.checkDuplicate) {
    return false;
  }

  const title = normalizeKey(
    cleanSongTitleForKey(song.title)
  );

  const artist = normalizeKey(song.artist);

  if (!title) {
    return false;
  }

  const key = title + "|" + artist;

  if (!STATISTICS.seenSongs[key]) {

    STATISTICS.seenSongs[key] = {

      title: song.title,

      artist: song.artist,

      platforms: [],

      boards: [],

      occurrences: 0

    };

  }

  const record = STATISTICS.seenSongs[key];

  // 判断当前歌曲此前是否已经出现在其他平台
  const crossPlatformDuplicate =
    record.platforms.length > 0 &&
    record.platforms.indexOf(platform) === -1;

  record.occurrences++;

  if (record.platforms.indexOf(platform) === -1) {
    record.platforms.push(platform);
  }

  if (record.boards.indexOf(boardName) === -1) {
    record.boards.push(boardName);
  }

  return crossPlatformDuplicate;

}


// ==========================================
// 10. 重复歌曲统一统计
// ==========================================

function finalizeDuplicateStats() {

  STATISTICS.duplicateSongs = 0;

  STATISTICS.duplicateDetails = [];

  Object.keys(STATISTICS.seenSongs).forEach(
    function (key) {

      const item = STATISTICS.seenSongs[key];

      if (item.platforms.length > 1) {

        STATISTICS.duplicateSongs++;

        STATISTICS.duplicateDetails.push({

          title: item.title,

          artist: item.artist,

          platforms: item.platforms.slice(),

          boards: item.boards.slice(),

          occurrences: item.occurrences

        });

      }

    }
  );

}


// // ======================================
// 11. 排名格式处理
// ==========================================

function formatRank(song, index) {

  return String(index + 1).padStart(2, "0");

}

 // =====================================
// 12. 通知函数
// 支持真实榜单更新时间、跨平台重复筛选和通知跳转
// ==========================================

function notifyBoard(name, subtitle, songs, url, platform, updateTime) {

  if (!songs || songs.length === 0) {

    console.log("⚠️ " + name + "没有获取到歌曲");

    return;

  }

  // ----------------------------------------
  // 时间处理
  // ----------------------------------------

  const fetchTime = formatDateTime(new Date());

let displayTime = null;
let timeLabel = "榜单更新时间";

  if (updateTime) {

    // QQ音乐：只有年月日
    if (
      typeof updateTime === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(updateTime)
    ) {

      displayTime = updateTime;
      timeLabel = "榜单更新时间";

    } else {

      const parsedTime = new Date(updateTime);

      if (!isNaN(parsedTime.getTime())) {

        displayTime = formatDateTime(parsedTime);
        timeLabel = "榜单更新时间";

      }

    }

  }

  // ----------------------------------------
  // 跨平台重复歌曲筛选
  // ----------------------------------------

  const finalSongs = [];

  let removedCount = 0;

  songs.forEach(function (song) {

    const title = cleanSongTitle(song.title);

    const artist = song.artist || "未知歌手";

    const isDuplicate = checkDuplicate(
      {
        title: title,
        artist: artist
      },
      platform || name,
      name
    );

    if (CONFIG.deduplicate && isDuplicate) {

      removedCount++;

      STATISTICS.filteredSongs++;

      return;

    }

    finalSongs.push({

      title: title,

      artist: artist,

      rank: song.rank

    });

  });

  if (removedCount > 0) {

    console.log(
      "跨平台重复筛除：" + removedCount + "首"
    );

  }

  if (finalSongs.length === 0) {

    ERROR_OUTPUTS.push(
      "⚠️ " + name +
      "：歌曲均为此前平台已出现的重复歌曲"
    );

    return;

  }

  // ----------------------------------------
  // 通知正文
  // ----------------------------------------

  let message = "";

  finalSongs.forEach(function (song, index) {

    const rank = String(
  song.rank || (index + 1)
).padStart(2, "0");

    message +=
      rank + ". " +
      song.title + " — " +
      song.artist;

    if (index !== finalSongs.length - 1) {
      message += "\n";
    }

  });

if (displayTime && CONFIG.showFetchTime) {

  message += "\n\n";

  message += timeLabel + "：" + displayTime;

}

  // ----------------------------------------
  // V1.6 榜单日志缓存
  // ----------------------------------------

  BOARD_OUTPUTS.push(
    "【" + name + "】\n\n" +
    message
  );

  // ----------------------------------------
  // 通知标题
  // ----------------------------------------

  const notificationTitle = "🎵 " + name;

  let notificationSubtitle =
    subtitle + " · Top " + finalSongs.length;

  if (CONFIG.showVersion) {
    notificationSubtitle += " · V1.6";
  }

  // ----------------------------------------
  // 通知跳转
  // ----------------------------------------

  if (CONFIG.openUrl && url) {

    $notification.post(
      notificationTitle,
      notificationSubtitle,
      message,
      {
        openUrl: url
      }
    );

    console.log("通知跳转已启用");

  } else {

    $notification.post(
      notificationTitle,
      notificationSubtitle,
      message
    );

  }

  console.log("通知已提交：" + name);

}


// ======================================
// 13. 歌手字段统一处理
// ======================================

function normalizeArtist(value) {

  if (!value) {
    return "未知歌手";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {

    return value.map(function (item) {

      if (typeof item === "string") {
        return item;
      }

      return (
        item.name ||
        item.title ||
        item.artistName ||
        ""
      );

    }).filter(Boolean).join(" / ");

  }

  if (typeof value === "object") {

    return (
      value.name ||
      value.title ||
      value.artistName ||
      "未知歌手"
    );

  }

  return "未知歌手";

}


// ======================================
// 14. 歌曲字段统一处理
// ======================================

function normalizeTrack(track, index) {

  track = track || {};

  return {

    title:
      track.title ||
      track.name ||
      track.song_name ||
      track.songName ||
      track.trackName ||
      "未知歌曲",

    artist: normalizeArtist(
      track.artist ||
      track.artists ||
      track.singer ||
      track.author ||
      track.artist_name
    ),

    rank:
      track.rank ||
      track.currentRank ||
      track.position ||
      index + 1

  };

}


// ======================================
// 15. Apple Music
// 官方 RSS 接口及备用接口
// =====================================

async function runApple() {

  console.log("\n========== Apple Music ==========");

  const urls = [

    "https://rss.marketingtools.apple.com/api/v2/cn/music/most-played/" +
    LIMIT +
    "/songs.json",

    "https://rss.applemarketingtools.com/api/v2/cn/music/most-played/" +
    LIMIT +
    "/songs.json"

  ];

  const headers = {

    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",

    "Accept": "application/json",

    "Referer": "https://music.apple.com/"

  };

  let data = null;

  let lastError = null;

  for (let i = 0; i < urls.length; i++) {

    try {

      console.log(
        "正在请求 Apple Music 接口" + (i + 1)
      );

      data = await new Promise(function (resolve, reject) {

        $httpClient.get({

          url: urls[i],

          headers: headers

        }, function (error, response, body) {

          if (error) {

            reject(new Error(String(error)));

            return;

          }

          if (!response) {

            reject(new Error("没有收到服务器响应"));

            return;

          }

          if (
            response.status < 200 ||
            response.status >= 300
          ) {

            reject(new Error(
              "HTTP状态码：" + response.status
            ));

            return;

          }

          resolve(body);

        });

      });

      console.log(
        "Apple接口" + (i + 1) + "请求成功"
      );

      break;

    } catch (error) {

      lastError = error;

      console.log(
        "Apple接口" + (i + 1) + "请求失败：" +
        String(error)
      );

    }

  }

  if (!data) {

    throw lastError ||
      new Error("Apple Music 所有接口均请求失败");

  }

  const json = parseJSON(data);

  const results =
    json.feed && json.feed.results
      ? json.feed.results
      : [];

  if (!results.length) {

    throw new Error("Apple Music 没有返回歌曲数据");

  }

  const songs = results
    .slice(0, LIMIT)
    .map(function (item, index) {

      return {

        title: item.name || "未知歌曲",

        artist: item.artistName || "未知歌手",

        rank: index + 1

      };

    });

notifyBoard(
  "Apple Music 热门歌曲",
  "中国区热门歌曲",
  songs,
  "https://music.apple.com/cn/charts",
  "Apple Music",
  json.feed.updated || null
);

}


// ======================================
// 16. QQ音乐
// 巅峰榜·热歌榜 ID：26
// ======================================

async function runQQ() {

  console.log("\n========== QQ音乐 ==========");

  const url =
    "https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg" +
    "?g_tk=5381" +
    "&uin=0" +
    "&format=jsonp" +
    "&jsonpCallback=callback" +
    "&inCharset=utf-8" +
    "&outCharset=utf-8" +
    "&notice=0" +
    "&platform=h5" +
    "&needNewCode=1" +
    "&tpl=3" +
    "&page=detail" +
    "&type=top" +
    "&topid=26" +
    "&_=" + Date.now();

  const headers = {

    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",

    "Referer": "https://y.qq.com/"

  };

  const body = await get(url, headers);

  const jsonStart = body.indexOf("{");

  const jsonEnd = body.lastIndexOf("}");

  if (
    jsonStart === -1 ||
    jsonEnd === -1 ||
    jsonEnd <= jsonStart
  ) {

    throw new Error(
      "QQ音乐返回内容中没有找到有效JSON"
    );

  }

  const jsonText = body.substring(
    jsonStart,
    jsonEnd + 1
  );

  const json = parseJSON(jsonText);


  const songlist =
    json.songlist ||
    (
      json.toplist &&
      json.toplist.data &&
      json.toplist.data.song
    ) ||
    (
      json.data &&
      json.data.songlist
    ) ||
    [];

  if (!songlist.length) {

    throw new Error("QQ音乐没有返回歌曲数据");

  }

  const songs = songlist
    .slice(0, LIMIT)
    .map(function (item, index) {

      const song = item.data || item;

      let artist = "未知歌手";

      if (
        Array.isArray(song.singer) &&
        song.singer.length
      ) {

        artist = song.singer
          .map(function (s) {
            return s.name || "";
          })
          .filter(Boolean)
          .join(" / ");

      } else if (song.singername) {

        artist = song.singername;

      } else if (song.singer || song.artists) {

        artist = normalizeArtist(
          song.singer || song.artists
        );

      }

      return {

        title:
          song.songname ||
          song.name ||
          song.title ||
          "未知歌曲",

        artist: artist,

        rank:
          song.rank ||
          song.cur_rank ||
          index + 1

      };

    });

  if (
    songs.every(function (s) {
      return s.title === "未知歌曲";
    })
  ) {

    throw new Error("QQ音乐歌曲字段解析失败");

  }

notifyBoard(
  "QQ音乐 巅峰榜·热歌榜",
  "巅峰榜·热歌榜",
  songs,
  "https://y.qq.com/n/ryqq/toplist/26",
  "QQ音乐",
  json.update_time || json.date || null
);

}

// =====================================
// 17. 网易云音乐
// 飙升榜 ID：19723756
// =====================================

async function runNetease() {

  console.log("\n========== 网易云音乐 ==========");

  const url =
    "https://music.163.com/api/playlist/detail?id=19723756&n=100";

  const headers = {

    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",

    "Referer": "https://music.163.com/"

  };

  const body = await get(url, headers);

  const json = parseJSON(body);

  const playlist =
    json.playlist ||
    (
      json.result &&
      json.result.playlist
    ) ||
    json.result ||
    json;

  const tracks = playlist.tracks || [];


  if (!tracks.length) {

    throw new Error("网易云音乐没有返回歌曲数据");

  }

  const songs = tracks
    .slice(0, LIMIT)
    .map(function (track, index) {

      return {

        title: track.name || "未知歌曲",

        artist: normalizeArtist(
          track.ar || track.artists
        ),

        rank: index + 1

      };

    });

 notifyBoard(
    "网易云音乐 飙升榜",
    "飙升榜",
    songs,
    "https://music.163.com/#/discover/toplist?id=19723756",
    "网易云音乐",
    playlist.updateTime || null
  );

}


// ==================================
// 18. 抖音 / 汽水音乐公共数据
// 多平台模式下只请求一次
// =====================================

async function getXingyuanBoards() {

  if (XINGYUAN_BOARDS) {
    return XINGYUAN_BOARDS;
  }

  console.log(
    "\n========== 抖音 / 汽水音乐公共数据 =========="
  );

  const url = "https://xingyuan.beer/charts.json";

  const headers = {

    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",

    "Accept": "application/json"

  };

  const body = await get(url, headers);

  const json = parseJSON(body);

  if (
    !json.boards ||
    !Array.isArray(json.boards)
  ) {

    throw new Error(
      "公共数据中没有找到 boards"
    );

  }

  console.log(
    "公共榜单数据获取成功，榜单数量：" +
    json.boards.length
  );

  XINGYUAN_BOARDS = json.boards;

  return XINGYUAN_BOARDS;

}


// ==========================================
// 19. 抖音热歌榜
// ==========================================

async function runDouyinHot(boards) {

  console.log("\n========== 抖音热歌榜 ==========");

  const board = boards.find(function (item) {

    return (
      item.platform === "douyin" &&
      item.board === "music_hot"
    );

  });

  if (!board || !board.tracks) {

    throw new Error("没有找到抖音热歌榜数据");

  }

  const songs = board.tracks
    .slice(0, LIMIT)
    .map(normalizeTrack);

  notifyBoard(
    "抖音 热歌榜",
    "抖音热歌榜",
    songs,
    "https://xingyuan.beer/board/douyin/douyin-hot",
    "抖音"
  );

}


// ==========================================
// 20. 抖音飙升榜
// ==========================================

async function runDouyinRise(boards) {

  console.log("\n========== 抖音飙升榜 ==========");

  const board = boards.find(function (item) {

    return (
      item.platform === "douyin" &&
      item.board === "music_rise"
    );

  });

  if (!board || !board.tracks) {

    throw new Error("没有找到抖音飙升榜数据");

  }

  const songs = board.tracks
    .slice(0, LIMIT)
    .map(normalizeTrack);

  notifyBoard(
    "抖音 飙升榜",
    "抖音飙升榜",
    songs,
    "https://xingyuan.beer/board/douyin/douyin-rise",
    "抖音"
  );

}


// ==========================================
// 21. 汽水音乐热歌榜
// ==========================================

async function runQishuiHot(boards) {

  console.log("\n========== 汽水音乐热歌榜 ==========");

  const board = boards.find(function (item) {

    return (
      item.name === "汽水音乐 汽水热歌榜" ||
      item.board_name === "汽水热歌榜"
    );

  });

  if (!board || !board.tracks) {

    throw new Error("没有找到汽水音乐热歌榜数据");

  }

  const songs = board.tracks
    .slice(0, LIMIT)
    .map(normalizeTrack);

  notifyBoard(
    "汽水音乐 热歌榜",
    "汽水热歌榜",
    songs,
    "https://xingyuan.beer/board/qishui/qishui-hot",
    "汽水音乐"
  );

}


// ==========================================
// 22. 汽水音乐新歌榜
// ==========================================

async function runQishuiNew(boards) {

  console.log("\n========== 汽水音乐新歌榜 ==========");

  const board = boards.find(function (item) {

    return (
      item.name === "汽水音乐 汽水新歌榜" ||
      item.board_name === "汽水新歌榜"
    );

  });

  if (!board || !board.tracks) {

    throw new Error("没有找到汽水音乐新歌榜数据");

  }

  const songs = board.tracks
    .slice(0, LIMIT)
    .map(normalizeTrack);

  notifyBoard(
    "汽水音乐 新歌榜",
    "汽水新歌榜",
    songs,
    "https://xingyuan.beer/board/qishui/qishui-new",
    "汽水音乐"
  );

}


// ==========================================
// 23. Spotify 全球周榜
// ==========================================

async function runSpotify() {

  console.log("\n========== Spotify 全球周榜 ==========");

  const url =
    "https://charts-spotify-com-service.spotify.com/public/v0/charts";

  const headers = {

    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",

    "Accept": "application/json",

    "Referer": "https://charts.spotify.com/"

  };

  const body = await get(url, headers);

  const json = parseJSON(body);

  const charts =
    json.chartEntryViewResponses || [];

  if (!charts.length) {

    throw new Error("Spotify没有返回榜单数据");

  }

  const entries =
    charts[0].entries || [];

  if (!entries.length) {

    throw new Error("Spotify没有返回歌曲数据");

  }

  const songs = entries
    .slice(0, LIMIT)
    .map(function (entry, index) {

      const meta =
        entry.trackMetadata || {};

      const artists =
        meta.artists || [];

      const artistNames = artists.map(
        function (item) {
          return item.name || "";
        }
      ).filter(Boolean);

      return {

        title:
          meta.trackName ||
          "未知歌曲",

        artist:
          artistNames.join(" / ") ||
          "未知歌手",

        rank:
          entry.chartEntryData &&
          entry.chartEntryData.currentRank
            ? entry.chartEntryData.currentRank
            : index + 1

      };

    });

  notifyBoard(
    "Spotify 全球周榜",
    "全球每周热门歌曲",
    songs,
    "https://charts.spotify.com/charts/view/regional-global-weekly/latest",
    "Spotify"
  );

}


// ==========================================
// 24. 随机单平台模式
// 无 BoxJS 时使用
// ==========================================

function selectRandomPlatform() {

  const platforms = [

    {
      name: "Apple Music",
      callback: runApple
    },

    {
      name: "QQ音乐",
      callback: runQQ
    },

    {
      name: "网易云音乐",
      callback: runNetease
    },

    {
      name: "抖音",

      callback: async function () {

        const boards = await getXingyuanBoards();

        const chooseRise = Math.random() < 0.5;

        if (chooseRise) {

          console.log("随机选择：抖音飙升榜");

          await runDouyinRise(boards);

        } else {

          console.log("随机选择：抖音热歌榜");

          await runDouyinHot(boards);

        }

      }

    },

    {
      name: "汽水音乐",

      callback: async function () {

        const boards = await getXingyuanBoards();

        const chooseNew = Math.random() < 0.5;

        if (chooseNew) {

          console.log("随机选择：汽水音乐新歌榜");

          await runQishuiNew(boards);

        } else {

          console.log("随机选择：汽水音乐热歌榜");

          await runQishuiHot(boards);

        }

      }

    },

    {
      name: "Spotify",
      callback: runSpotify
    }

  ];

  const index = Math.floor(
    Math.random() * platforms.length
  );

  return platforms[index];

}


// ==========================================
// 25. BoxJS 多平台任务
// ==========================================

function getBoxTasks() {

  const tasks = [];

  BOX_CONFIG.platforms.forEach(function (platform) {

    if (platform === "apple") {

      tasks.push({
        name: "Apple Music",
        callback: runApple
      });

    }

    if (platform === "qq") {

      tasks.push({
        name: "QQ音乐",
        callback: runQQ
      });

    }

    if (platform === "netease") {

      tasks.push({
        name: "网易云音乐",
        callback: runNetease
      });

    }

    if (platform === "douyin") {

      tasks.push({

        name: "抖音",

        callback: async function () {

          const boards = await getXingyuanBoards();

          if (BOX_CONFIG.douyinType === "soaring") {

            console.log("BoxJS指定榜单：抖音飙升榜");

            await runDouyinRise(boards);

          } else {

            console.log("BoxJS指定榜单：抖音热歌榜");

            await runDouyinHot(boards);

          }

        }

      });

    }

    if (platform === "qishui") {

      tasks.push({

        name: "汽水音乐",

        callback: async function () {

          const boards = await getXingyuanBoards();

          const chooseNew = Math.random() < 0.5;

          if (chooseNew) {

            console.log("随机选择：汽水音乐新歌榜");

            await runQishuiNew(boards);

          } else {

            console.log("随机选择：汽水音乐热歌榜");

            await runQishuiHot(boards);

          }

        }

      });

    }

    if (platform === "spotify") {

      tasks.push({
        name: "Spotify",
        callback: runSpotify
      });

    }

  });

  return tasks;

}


// ==========================================
// 26. 重复歌曲日志
// ==========================================

// ==========================================
// 26. 重复歌曲日志
// ==========================================

function printDuplicateStats() {

  finalizeDuplicateStats();

  if (
    STATISTICS.duplicateSongs <= 0 &&
    STATISTICS.filteredSongs <= 0
  ) {
    return;
  }

  DUPLICATE_OUTPUTS.push(
    "【重复歌曲统计】"
  );

  DUPLICATE_OUTPUTS.push(
    "重复歌曲：" +
    STATISTICS.duplicateSongs +
    "首  |  筛除：" +
    STATISTICS.filteredSongs +
    "首"
  );

  STATISTICS.duplicateDetails.forEach(
    function (item, index) {

      DUPLICATE_OUTPUTS.push(
        (index + 1) +
        ". " +
        item.title +
        " — " +
        item.artist +
        "  " +
        item.occurrences +
        "次"
      );

    }
  );


  if (STATISTICS.filteredSongs > 0) {

    DUPLICATE_OUTPUTS.push(
      "重复歌曲筛除数量：" +
      STATISTICS.filteredSongs +
      "首"
    );

  }

}


// ==========================================
// 27. 主程序
// ==========================================

(async function () {

  console.log("\n");

  console.log("================================");

  console.log("多平台热歌榜");

  console.log("运行环境：Loon 3.5.3");

  console.log("================================");


let successCount = 0;

let failedCount = 0;

let selectedName = "";

let tasks = [];

const executionTime = formatDateTime(new Date());


  // ----------------------------------------
  // 模式判断
  // ----------------------------------------

  if (!BOX_CONFIG.enabled) {

    console.log("运行模式：随机单平台");

    const selected = selectRandomPlatform();

    selectedName = selected.name;

    tasks = [selected];

    console.log("\n========== 随机平台选择 ==========");

    console.log("随机抽中平台：" + selected.name);

    console.log("每次执行榜单数量：1");

    console.log("每个榜单歌曲数量：" + LIMIT);

    console.log("跨平台重复筛选：关闭");

    console.log("通知点击跳转：关闭");

  } else {

    console.log("运行模式：BoxJS配置模式");

    console.log("\n========== BoxJS配置 ==========");

    console.log(
      "选择平台：" +
      (
        BOX_CONFIG.platforms.length
          ? BOX_CONFIG.platforms.join(" / ")
          : "未选择"
      )
    );

    console.log("每个榜单歌曲数量：" + LIMIT);

    console.log(
      "抖音榜单类型：" +
      (
        BOX_CONFIG.douyinType === "soaring"
          ? "飙升榜"
          : "热歌榜"
      )
    );

    console.log(
      "跨平台重复筛选：" +
      (CONFIG.deduplicate ? "开启" : "关闭")
    );

    console.log(
      "通知点击跳转：" +
      (CONFIG.openUrl ? "开启" : "关闭")
    );

    tasks = getBoxTasks();

    if (tasks.length === 0) {

      console.log("\n⚠️ BoxJS没有选择任何有效平台");

      console.log("请在BoxJS中至少选择一个推送平台");

      console.log("================================");

      $done();

      return;

    }

    selectedName = tasks.map(function (item) {
      return item.name;
    }).join(" / ");

  }


  // // ----------------------------------------
// 开始执行任务
// ----------------------------------------

for (let i = 0; i < tasks.length; i++) {

  const task = tasks[i];

  try {

    await task.callback();

    successCount++;

  } catch (error) {

    failedCount++;

    ERROR_OUTPUTS.push(
      task.name + "：" + String(error)
    );

  }

}


  // ----------------------------------------
  // 重复歌曲统计
  // ----------------------------------------

  printDuplicateStats();


// ==========================================
// V1.6 最终日志输出
// ==========================================

ORIGINAL_CONSOLE_LOG(
  "================================="
);

ORIGINAL_CONSOLE_LOG(
  "🎵 多平台热歌榜"
);

ORIGINAL_CONSOLE_LOG(
  "运行模式：" +
  (BOX_CONFIG.enabled
    ? "BoxJS 配置模式"
    : "随机单平台")
);

ORIGINAL_CONSOLE_LOG(
  "平台数量：" + tasks.length +
  "  成功：" + successCount +
  "  失败：" + failedCount +
  "  清理：" + STATISTICS.cleanedTitles
);

ORIGINAL_CONSOLE_LOG(
  "跳转通知：" +
  (CONFIG.openUrl ? "开启" : "关闭")
);
ORIGINAL_CONSOLE_LOG(
  "数据获取时间：" + executionTime
);
ORIGINAL_CONSOLE_LOG(
  "================================="
);


// ----------------------------------------
// 榜单内容
// ----------------------------------------

BOARD_OUTPUTS.forEach(function (item) {

  ORIGINAL_CONSOLE_LOG("\n" + item);

});


// ----------------------------------------
// 异常信息（仅失败时显示）
// ----------------------------------------

if (ERROR_OUTPUTS.length > 0) {

  ORIGINAL_CONSOLE_LOG("\n【异常信息】");

  ERROR_OUTPUTS.forEach(function (item) {

    ORIGINAL_CONSOLE_LOG(item);

  });

}


// ----------------------------------------
// 重复歌曲详情（仅有重复时显示）
// ----------------------------------------

if (DUPLICATE_OUTPUTS.length > 0) {

  ORIGINAL_CONSOLE_LOG("\n");

  DUPLICATE_OUTPUTS.forEach(function (item) {

    ORIGINAL_CONSOLE_LOG(item);

  });

}


$done();
})();