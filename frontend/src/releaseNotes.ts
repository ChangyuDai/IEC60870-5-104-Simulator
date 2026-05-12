export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '子站 IEC 104 序列号实现修复: 之前激活确认 / 激活终止把主站发来的 APCI bytes 原样回送, 自己的 N(S)/N(R) 从不前进, 严格主站判协议违规直接 RST, 宽松主站则 t1 超时关链。本版引入 SeqState 把每条连接的序号统一收口, 收到 I 帧时正确推进 N(R), 发 ack/term 用 build_response_frame 重写 APCI 为子站自己的值',
  '子站 GI / 累计量召唤响应改批量构造: 默认站 160 数据点 × 3 CA 的总召前需要 ~960 次 await, 现整批在单 seq 锁内构造, 单次入队; TLS 阻塞路径上 send_gi_response_blocking 和 type 101 块同样合并为单 block_on + 单 write_all',
  '配合的主站补丁: 收到 STARTDT CON 之前不再发 I 帧, 严格按 IEC 60870-5-104 §5.3; 之前 TCP 握手完即允许发 I 帧, 合规子站会直接 RST',
  '上一版 v1.3.3 亮点: 主站 TLS 无条件关闭 hostname 校验, CA 链信任仍按 accept_invalid_certs 控制',
]
