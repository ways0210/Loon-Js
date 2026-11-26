// AppStore 版本监控｜Loon + BoxJS 正确版
// BoxJS填写的输入框，全部用 $persistentStore.read 读取
const appList = [];

// ==========读取APP1==========
const a1_name = ($persistentStore.read("app1_name") || "").trim();
const a1_id = ($persistentStore.read("app1_id") || "").trim();
const a1_cty = ($persistentStore.read("app1_country") || "").trim();
const a1_ver = ($persistentStore.read("app1_localVer") || "").trim();
if(a1_name && a1_id && a1_cty && a1_ver){
  appList.push({
    name:a1_name,
    id:a1_id,
    country:a1_cty,
    localVer:a1_ver
  })
}

// ==========读取APP2==========
const a2_name = ($persistentStore.read("app2_name") || "").trim();
const a2_id = ($persistentStore.read("app2_id") || "").trim();
const a2_cty = ($persistentStore.read("app2_country") || "").trim();
const a2_ver = ($persistentStore.read("app2_localVer") || "").trim();
if(a2_name && a2_id && a2_cty && a2_ver){
  appList.push({
    name:a2_name,
    id:a2_id,
    country:a2_cty,
    localVer:a2_ver
  })
}

// ==========读取APP3==========
const a3_name = ($persistentStore.read("app3_name") || "").trim();
const a3_id = ($persistentStore.read("app3_id") || "").trim();
const a3_cty = ($persistentStore.read("app3_country") || "").trim();
const a3_ver = ($persistentStore.read("app3_localVer") || "").trim();
if(a3_name && a3_id && a3_cty && a3_ver){
  appList.push({
    name:a3_name,
    id:a3_id,
    country:a3_cty,
    localVer:a3_ver
  })
}

function getAppIdFromLink(url) {
  const m = url.match(/id(\d+)/);
  return m ? m[1] : null;
}

function checkOne(item, doneAll) {
  const aid = item.id || getAppIdFromLink(item.link);
  if (!aid) return doneAll();
  const url = `https://itunes.apple.com/lookup?id=${aid}&country=${item.country}&media=software`;
  $httpClient.get(url, (err, resp, body) => {
    if (err || !resp || resp.status !== 200) {
      console.log(item.name + " 请求失败");
      return doneAll();
    }
    try {
      const json = JSON.parse(body);
      if (!json.results || json.results.length === 0) return doneAll();
      const app = json.results[0];
      const storeVer = app.version;
      const storeLink = app.trackViewUrl;
      const key = `asmon_${aid}`;
      const oldVer = $persistentStore.read(key);

      if (!oldVer) {
        $persistentStore.write(storeVer, key);
        console.log(`【${item.name}】首次记录商店版本：${storeVer}`);
        return doneAll();
      }

      if (storeVer !== oldVer) {
        $persistentStore.write(storeVer, key);
        $notification.post(
          "App 更新提醒",
          `${item.name}｜商店新版：${storeVer}`,
          `本地版本：${item.localVer}`,
          { openUrl: storeLink }
        );
      } else if (storeVer !== item.localVer) {
        $notification.post(
          "App 可更新",
          `${item.name}｜AppStore：${storeVer}`,
          `本地：${item.localVer}`,
          { openUrl: storeLink }
        );
        $persistentStore.write(storeVer, key);
      }
    } catch (e) {
      console.log(item.name + " 解析出错：" + e.message);
    }
    doneAll();
  });
}

// 串行挨个检查
let idx = 0;
function next() {
  if (idx >= appList.length) return $done();
  const cur = appList[idx++];
  checkOne(cur, next);
}
next();