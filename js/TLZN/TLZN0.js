const url = `https://www.tailgdd.com/v1/api/shop/app/integral/sign/saveIntegralSignIn`;
const headers = {
'X-Requested-With': `XMLHttpRequest`,
'Connection': `keep-alive`,
'Content-Type': `application/json;charset=UTF-8`,
'Sec-Fetch-Site': `same-origin`,
'Origin': `https://www.tailgdd.com`,
'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.15 (KHTML, like Gecko) Mobile/15E148`,
'Authorization': `c3fwod5KRO6B%2FPX7o6YOu81xVzPu24uGlaH5jEOudIG2d%2FKZ6i51depGp9NkWDN1Yb8WaiP5osGoPwLzOs0jqFA9S%2F8iWAEdDDWIZmq9hj58irZjXtd9QXs2f%2BpA5PGmNGz2OyQWZd%2BJ%2Bi0xtq9I3S2GiD%2FloE1kpl2QbHrVO46OvV8QtFLCbOh4aQAFrL243XCTiZ2wh%2F%2FOvJbN6frIvKY9qpAsK8qbROElNdnsWvNoGbDesksVTv%2BG0Bvxd8CLexoKWWdtSGU%2FmdVf%2FJ%2B3M9NA%2BmTw9adhn3isqncQ3n8iONepFCFXzlJ3yTrneBAYTmPBUhdHg0MjwkqqhrdD97fD56fMqwRmHf%2F3uGv4O7oFrC7Ys%2FdnMScUl5%2FLe6juK35QT9XsuQJJrW23X3%2F5X8NiWiRZhX9yJNTFBg2Wk45%2FURHcpqAcOl2j0eUzCAyOOex4ywGUPv1WaRH83C6MKn%2FcCnMGyuSUv%2BprwruQ4XFpqIE2FARgnV9hJ9UFD9up%2FFra2zLrCfS%2FP3VV9i6wMFbbuQs4abQIBxmCNPVW3%2FaLVafD44SE%2FfYjXmDXkChk7MZPE5aFQwmRL3UscntMwoNMNkSn3Rvqd4HTpeStDUI28RchkAwCtSD7TL0Fw1svPWV303oXKL%2FELKUVVgNk%2BBMJVjFKDFPfRaXCCurUTtVoV9LH0BrZSsrEfZ50rWTlQXpFJX45dBteF4nnQssFPkBtWob4sdNGVe5sdQLP9KJwsBBX9tTazEoEzn1TqKCOzwAFjvitbQ%2FN%2FnpimpIiu1rrU2gUoB9ZfwP4ZMAaIvts39wiQ56i0hdKXh1m0Ml8YUotJ3fUmxNGfTJ4ZEvALSgVjZLYIttApqqW5LwpdqZq4uT%2Fk4NtRekueYvh%2BUDAdoAL5%2BUE9rpUbMF6kJhd5l2gweGvj%2B4GV6LJt%2FAPUS57xMMF%2FqYRVtvc8DZ4VwEBaDv%2BnV4tHfsFQA3DDFAZFBUun1wLMEf39STkaEvj4woQTkjBfYcyVI3MVMsSjmeuZ%2BImRkA5ZX1lvwWmtFD0OhExMJBa%2B8O0kaFEDZqhcBw%3D `,
'Sec-Fetch-Mode': `cors`,
'Cookie': `填写抓到的Cookie后保存 `,
'Referer': `https://www.tailgdd.com/travel/tailg-shop-h5/`,
'Accept-Language': `zh-CN,zh-Hans;q=0.9`,
'Accept': `application/json, text/plain, */*`
};
const body = `{}`;

$httpClient.post({
    url: url,
    headers: headers,
    body: body
},(error, response, data) => {
  if(error){
    console.log("请求失败: ", error);
    $notification.post("台铃智能App", "请求异常：" + error, "");
  }else{
    console.log("状态码：" + response.status + "\n返回内容：" + data);
    const res = JSON.parse(data);
    if(res.code === 100){
      $notification.post("台铃智能App", "❌ 请勿重复签到 ❌", "");
    }else if(res.code === 0){
      $notification.post("台铃智能App", "🎉 签 到 成 功 ✅", "");
    }else{
      $notification.post("台铃智能App", res.msg, "");
    }
  }
  $done();
});
