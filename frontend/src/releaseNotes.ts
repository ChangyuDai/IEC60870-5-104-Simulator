export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '主布局支持拖拽调整左右栏宽度: 服务器树和数据点详情两栏之间各加一条 hover 变蓝、按住可拖的细线分隔条; 拖完的宽度落 localStorage, 重启应用后恢复 (tree 180–480 px, 详情 220–600 px)',
  '左侧类别树每行多一个 TypeId chip: monospace 小 chip 显示该 category 对应的「无时标 · CP56 时标」typeid 对 (如 1 · 30, 9 · 34), 颜色用 IOA 同色系的 sky blue, 省去翻 IEC 60870-5-101 表',
  '数据点表表头列与数据列对齐: 之前表头 / body 是两个独立 <table>, 表头列没 CSS 宽度而 body 有, 默认 table-layout: auto 下两个 table 各算各的列宽 → 值 / 品质 / 时间戳 表头视觉错位; 改 th 复用 .col-* + table-layout: fixed 后彻底对齐',
  'macOS 首次启动指引更新到 Sequoia 行为: 旧 "右键 → 打开" 路径自 macOS 15 (Sequoia) 起被 Apple 移除, 弹窗只剩 完成 / 移到废纸篓; README 中英文双语重写为 系统设置 → 隐私与安全性 → 仍要打开 + xattr -dr com.apple.quarantine 兜底',
  '上一版 v1.3.4 亮点: 子站 IEC 104 序列号实现修复 + 主站 STARTDT CON 等待 + GI / 累计量召唤批量编帧',
]
