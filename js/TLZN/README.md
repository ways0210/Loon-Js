# 台铃智能App签到

# 使用方法
1.先订阅boxjs仓库
2.添加脚本到loon
3.打开loon的抓包功能或者其它抓包工具
4.到App里手动签到一次
5.返回loon把抓到的Authorization  
和Cookie填写到boxjs里保存
6.运行测试，如果失败则是没有填写正确

请求头 https://www.tailgdd.com
复制 Authorization 后面的长串字符 和 cookie
填写到boxjs的对应的窗口里后保存

它的cookie是两段  
例如：  
cookie: HWWAFSESID=46d701751f
cookie: HWWAFSESTIME=17956208
boxjs里的ck填写规则为  
HWWAFSESID=46d701751f;HWWAFSESTIME=17956208


# 订阅地址
```properties
https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/TLZN/TLZN.js
```
