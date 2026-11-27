# 网上国网 电费通知
# 使用说明  
脚本是通过第三方小组件来实现的  
因为个人能力不足  
目前无法找到直接获取国网数据的方法  
只能多此一举

# 教程开始  
1.先安装所需要的App（链接会放下面）  
2.下载对应小组件导入App里  
3.在App里运行小组件填入对应信息  
4.确保能正常看到数据  
5.然后复制请求脚本订阅  
6.在Loon里打开脚本  
7.一定要选择“远程订阅”不是本地脚本  
8.把链接粘贴进去保存即可  
9.在添加定时脚本  
10.App里再次运行一次小组件  
11.让它把数据发送到Loon里  
12.Loon的定时脚本就能正常通知了  
13.然后桌面创建小组件把App里的小组件加上  
正常情况下只要小组件数据刷新了  
Loon这面也会更新  
不用每次都打开小组件发送数据  
————————————————————————--  
# 请求脚本 （远程订阅）  
```properties
https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/95598/wsgw_sgcc.js
```
# 定时脚本
```properties
https://raw.githubusercontent.com/ways0210/Loon-Js/master/js/95598/sgcc_notify.js
```
————————————————————————--
[App安装](https://apps.apple.com/us/app/scriptable/id1405459188?l=zh-Hans-CN)    …………|…………   [小组件下载](https://www.icloud.com/attachment/?u=https%3A%2F%2Fcvws.icloud-content.com.cn%2FB%2FAYRMtOw8JWhBavLAAoGevvHkxoALAdg9U2nUhKbAX41iAnpPyU4W_Ars%2F%24%7Bf%7D%3Fo%3DAlpZF8dTUp6RxPc2Y8H-wBW7vphwgC8FzQhDRkc5K2vX%26v%3D1%26x%3D3%26a%3DCAog3fUiYE5SuFF-MOsRFsfnHwp1FhL4hZWvPR5BAOMCyGgSbxCdkMPxoTQYnaC-xas0IgEAUgTkxoALWgQW_ArsaicK3BkuaRBfm99ElhK1wFQXMK-an-Y4h3pHXbXq3BwOwYChi1c-XG9yJwF88H9PvDKUL332dZhZOqc8cgXd6O3aAwmyF7g6KskC_hYIXc7O5g%26e%3D1798394843%26fl%3D%26r%3D440CB76F-02E7-444C-B49F-3D5C6EAACE91-1%26k%3D%24%7Buk%7D%26ckc%3Dcom.apple.clouddocs%26ckz%3Dcom.apple.CloudDocs%26p%3D212%26s%3DjBEq1zOuQPNPVPg8kzs3bsy663Q&uk=lp6NPfoPBwWNnIXQYjjF_Q&f=SGCC.scriptable&sz=108782)
————————————————————————--
# 小组件下载后  
# 长按分享导入到App里后点击运行
