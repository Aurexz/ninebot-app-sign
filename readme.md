# ninebot-get-ncoin

## 使用说明

### 1. 准备脚本

将 `ninebot.js` 放入青龙面板的脚本目录：

```
/ql/scripts/ninebot.js
```

---

### 2. 设置环境变量

在青龙面板【环境变量】中新建变量：

| 变量名         | 说明                                                 |
| -------------- | ---------------------------------------------------- |
| NINEBOT_CONFIG | 多账号配置，每行一个，格式：`deviceId@authorization` |

示例：

```
abc123@Bearer abcdefghijklmnopqrstuvwxyz
xyz789@Bearer zyxwvutsrqponmlkjihgfedcba
```

---
