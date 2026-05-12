export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '主站收到 STARTDT CON 之前不再发 I 帧: 严格按 IEC 60870-5-104 §5.3, 主站发完 STARTDT ACT 必须等对端 STARTDT CON 才能发 GI / 累计量召唤 / 控制等 I 帧; 之前 TCP 握手完即认为 Connected 并允许发 I 帧, 严格子站直接 RST。现增 ProtocolState.startdt_acked, 发 I 帧前阻塞等待, 超 t1 返回明确错误',
  '配合的子站协议补丁: 子站激活确认 / 激活终止帧改用自己的 N(S)/N(R) (此前原样回送主站的 APCI), 收到 I 帧时正确推进 rsn, 每条连接单一序号源 SeqState 替换原先 read-loop / cyclic / TLS handler 各持一份的局部计数器',
  '子站 GI / 累计量召唤响应改批量构造: 默认站 160 数据点 × 3 CA 的总召前需 ~960 次 await, 现整批在单 seq 锁内构造、单次入队; TLS 阻塞路径同样合并为单 block_on + 单 write_all',
  '上一版 v1.3.3 亮点: 主站 TLS 无条件关闭 hostname 校验 (现场证书 CN 多为设备序列号), CA 链信任仍按 accept_invalid_certs 控制',
]
