const ck = $read("@tailing.ck");
if (!ck) {
  $notification.post("台铃智能App", "❌请先在BoxJS填写台铃Cookie");
  $done();
}

const url = `https://www.tailgdd.com/v1/api/shop/app/integral/sign/saveIntegralSignIn`;
const headers = {
'X-Requested-With': `XMLHttpRequest`,
'Connection': `keep-alive`,
'Content-Type': `application/json;charset=UTF-8`,
'Sec-Fetch-Site': `same-origin`,
'Origin': `https://www.tailgdd.com`,
'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.15 (KHTML, like Gecko) Mobile/15E148`,
'Sec-Fetch-Mode': `cors`,
'Cookie': ck,
'Referer': `https://www.tailgdd.com/travel/tailg-shop-h5/`,
'Accept-Language': `zh-CN,zh-Hans;q=0.9`,
'Accept': `application/json, text/plain, */*`
};
const body = `{}`;

console.log("读到的CK：" + ck);
$httpClient.post({
    url: url,
    headers: headers,
    body: body
},(error, response, data) => {
  if(error){
    console.log("❌请求失败: ", error);
    $notification.post("台铃智能App", "请求异常：" + error);
  }else{
    console.log("状态码：" + response.status);
    console.log("返回内容：" + data);
    try {
      const res = JSON.parse(data);
      if(res.code === 100){
        $notification.post("台铃智能App", "❌ 请勿重复签到");
      }else if(res.code === 0){
        $notification.post("台铃智能App", "✅ 签到成功");
      }else{
        $notification.post("台铃智能App", "提示：" + (res.msg || "未知返回"));
      }
    } catch(e) {
      console.log("解析JSON失败：", e);
      $notification.post("台铃智能App", "返回不是JSON");
    }
  }
  $done();
});
