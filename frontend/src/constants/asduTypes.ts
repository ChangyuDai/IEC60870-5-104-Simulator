// 共享 ASDU 类型清单：用于 BatchAddModal / DataPointModal 等 dropdown。
// `value` 是后端 `parse_asdu_type` 接受的 PascalCase 枚举名；
// `labelKey` 是 i18n 字典里的 key（zh-CN / en-US 在 asduType.* 下定义）；
// `typeId` 是 IEC 60870-5-101/104 type identification 数字编号,
// 与 crates/iec104sim-core/src/types.rs::AsduTypeId 一致。
export interface AsduTypeOption {
  value: string
  labelKey: string
  typeId: number
}

export const ASDU_TYPE_OPTIONS: AsduTypeOption[] = [
  { value: 'MSpNa1', labelKey: 'asduType.sp',    typeId: 1 },
  { value: 'MSpTb1', labelKey: 'asduType.sp_tb', typeId: 30 },
  { value: 'MDpNa1', labelKey: 'asduType.dp',    typeId: 3 },
  { value: 'MDpTb1', labelKey: 'asduType.dp_tb', typeId: 31 },
  { value: 'MStNa1', labelKey: 'asduType.st',    typeId: 5 },
  { value: 'MStTb1', labelKey: 'asduType.st_tb', typeId: 32 },
  { value: 'MBoNa1', labelKey: 'asduType.bo',    typeId: 7 },
  { value: 'MBoTb1', labelKey: 'asduType.bo_tb', typeId: 33 },
  { value: 'MMeNa1', labelKey: 'asduType.me_na', typeId: 9 },
  { value: 'MMeTd1', labelKey: 'asduType.me_td', typeId: 34 },
  { value: 'MMeNd1', labelKey: 'asduType.me_nd', typeId: 21 },
  { value: 'MMeNb1', labelKey: 'asduType.me_nb', typeId: 11 },
  { value: 'MMeTe1', labelKey: 'asduType.me_te', typeId: 35 },
  { value: 'MMeNc1', labelKey: 'asduType.me_nc', typeId: 13 },
  { value: 'MMeTf1', labelKey: 'asduType.me_tf', typeId: 36 },
  { value: 'MItNa1', labelKey: 'asduType.it',    typeId: 15 },
  { value: 'MItTb1', labelKey: 'asduType.it_tb', typeId: 37 },
]
