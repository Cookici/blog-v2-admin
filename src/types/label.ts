// 标签查询参数
export interface LabelPageQuery {
    page: number
    pageSize: number
    keyword?: string
}

// 标签更新命令
export interface LabelUpdateCommand {
    labelId: string
    labelName: string
    labelAlias: string
    labelDescription: string
}

export interface LabelInsertCommand {
    labelName: string
    labelAlias: string
    labelDescription: string
}

// 标签删除命令
export interface LabelDeleteCommand {
    labelId: string
  }