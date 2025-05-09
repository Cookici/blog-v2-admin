import type { ArticleDailyCountDTO } from './article'
import type { CommentDailyCountDTO } from './comment'

export interface DashboardDataQuery {
  startDate: string
  endDate: string
}

export interface DashboardCountData {
  userCount: number
  articleCount: number
  commentCount: number
  tagCount: number
}

export type { ArticleDailyCountDTO, CommentDailyCountDTO }