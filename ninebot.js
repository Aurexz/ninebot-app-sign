#!/usr/bin/env node

/**
 * 九号出行签到脚本（支持青龙面板，自动读取环境变量）
 *
 * 使用方法：
 * 1. 将本文件放入 /ql/scripts/ninebot.js
 * 2. 在青龙面板添加环境变量：
 *    - 名称：NINEBOT_CONFIG
 *    - 值格式：deviceId@authorization（多个账号用换行或 & 分隔）
 * 3. 添加定时任务：
 *    - 命令：node /ql/scripts/ninebot.js
 *    - 定时：0 7-9 * * *
 *    - 最大随机延迟：30（分钟）
 */

import got from "got";
let sendNotify;
try {
  const notifyModule = await import(
    `${process.env.QL_DIR || "/ql"}/scripts/sendNotify.js`
  );
  sendNotify = notifyModule.sendNotify;
} catch (err) {
  console.error("❌ 无法加载 sendNotify.js：", err.message);
  sendNotify = async (title, msg) => console.log(`[通知] ${title}\\n${msg}`);
}

const configRaw = process.env.NINEBOT_CONFIG || "";

if (!configRaw) {
  console.error("未设置环境变量 NINEBOT_CONFIG");
  process.exit(1);
}

const accounts = configRaw
  .split(/[\n&]+/)
  .map((line) => {
    const [deviceId, authorization] = line.trim().split("@");
    return { deviceId, authorization };
  })
  .filter((acc) => acc.deviceId && acc.authorization);

if (accounts.length === 0) {
  console.error("未检测到有效账号配置，请检查 NINEBOT_CONFIG 格式");
  process.exit(1);
}

const SIGN_URL =
  "https://cn-cbu-gateway.ninebot.com/portal/api/user-sign/v2/sign";
const STATUS_URL =
  "https://cn-cbu-gateway.ninebot.com/portal/api/user-sign/v2/status";

async function getSignStatus(deviceId, authorization) {
  const client = got.extend({
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: authorization,
      Origin: "https://h5-bj.ninebot.com",
      Referer: "https://h5-bj.ninebot.com/",
      "User-Agent": "NinebotApp/6.9.3 (iOS; iPhone12,1; zh_CN; Scale/3.00)",
      "X-Client-Version": "6.9.3",
      "X-Client-Platform": "iOS",
    },
    responseType: "json",
    timeout: { request: 10000 },
  });

  try {
    const { body, statusCode } = await client.get(STATUS_URL, {
      searchParams: { t: Date.now() },
    });
    if (statusCode !== 200) return [null, `HTTP ${statusCode}`];
    if (body.code !== 0) return [null, body.msg || "未知错误"];
    return [body.data, ""];
  } catch (err) {
    return [null, `验证异常：${err.message}`];
  }
}

async function performSignIn(deviceId, authorization) {
  const client = got.extend({
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: authorization,
      Origin: "https://h5-bj.ninebot.com",
      Referer: "https://h5-bj.ninebot.com/",
      "User-Agent": "NinebotApp/6.9.3 (iOS; iPhone12,1; zh_CN; Scale/3.00)",
      "X-Client-Version": "6.9.3",
      "X-Client-Platform": "iOS",
    },
    responseType: "json",
    timeout: { request: 10000 },
  });

  try {
    const { body, statusCode } = await client.post(SIGN_URL, {
      json: { deviceId },
    });
    if (statusCode !== 200) return `签到失败：HTTP ${statusCode}`;
    if (body.code !== 0) return `签到失败：${body.msg || "未知错误"}`;
    return "签到成功";
  } catch (err) {
    return `签到异常：${err.message}`;
  }
}

(async () => {
  const globalLogs = [];

  for (let i = 0; i < accounts.length; i++) {
    const { deviceId, authorization } = accounts[i];
    const logs = [];
    logs.push(`账号 ${i + 1}`);

    const [statusData, errorMsg] = await getSignStatus(deviceId, authorization);

    if (statusData) {
      logs.push(`连续签到天数：${statusData.consecutiveDays || 0} 天`);
      logs.push(
        `今日签到状态：${
          statusData.currentSignStatus === 1 ? "已签到" : "未签到"
        }`
      );
      if (statusData.currentSignStatus !== 1) {
        logs.push(await performSignIn(deviceId, authorization));
      }
    } else {
      logs.push(`获取状态失败：${errorMsg}`);
    }

    globalLogs.push(logs.join("\n"));
  }

  const result = globalLogs.join("\n\n");
  console.log(result);
  await sendNotify("九号出行签到", result);
})();
