import type { UserInfo } from './user'

export interface CommentDTO {
  commentId: string
  commentContent: string
  commentImg?: string
  parentCommentId: string
  commentList?: CommentDTO[]
  userId: string
  articleId: string
  createTime: string
  updateTime: string
  userInfo: UserInfo
  toUserInfo?: UserInfo
  isDeleted:number
}


export interface CommentPageQuery {
  page: number
  pageSize: number
  keyword: string
}

export interface CommentChildPageQuery {
  commentId: string
  page: number
  pageSize: number
  keyword: string
}

export interface CommentDeleteCommand {
  commentId: string
  parentCommentId: string
  keyword?: string
}


export interface CommentDailyCountDTO {
  date: string
  count: number
}


