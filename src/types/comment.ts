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
}

export interface CommentChildPageQuery {
  commentId: string
  page: number
  pageSize: number
}

export interface CommentDeleteCommand {
  commentId: string
  parentCommentId: string
}


