# 九号出行 APP 签到

## 青龙

在青龙面板【环境变量】中新建变量：

| 变量名         | 值                       | 参数说明                |
| -------------- | ------------------------ | ----------------------- |
| NINEBOT_CONFIG | `deviceId@authorization` | 多个账号用换行或 & 分隔 |

> "deviceId": 在 app 中抓取/portal/api/user-sign/v2/sign 请求参数，获取 deviceId。
> "authorization": 抓取上述接口的*请求头*，获取 authorization。
