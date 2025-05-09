import type { UserInfo } from './user'

// 文章标签
export interface LabelDTO {
  labelId: string
  labelName: string
  labelAlias?: string
  labelDescription?: string
  isDeleted: number
}
export interface ArticleDailyCountDTO {
  date: string
  count: number
}

// 文章信息
export interface ArticleDTO {
  articleId: string
  userId: string
  articleTitle: string
  articleContent: string
  createTime: string
  updateTime: string
  userInfo: UserInfo
  labels: LabelDTO[]
  viewCount: number
  likeCount: number
  status: string
  isDeleted: number
}

// 分页查询参数
export interface ArticlePageQuery {
  page: number
  pageSize: number
  articleTitle?: string
  articleContent?: string
  status?: string
  isDeleted?: number
}