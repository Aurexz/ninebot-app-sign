# 九号出行自动签到

## 青龙

在青龙面板【环境变量】中新建变量：

| 变量名         | 值                       | 参数说明                |
| -------------- | ------------------------ | ----------------------- |
| NINEBOT_CONFIG | `deviceId@authorization` | 多个账号用换行或 & 分隔 |

> "deviceId": 在 APP 中抓取，找到/portal/api/user-sign/v2/sign，在该 request 参数  
> "authorization": 从该 API 的 headers
