export interface Challenge {
  id: string
  number: number
  title: string
  description: string
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  challenge_id?: string
  created_at: string
}

export interface Vote {
  id: string
  user_email: string
  user_name: string
  best_category_id: string
  nice_category_id: string
  own_category_id: string
  created_at: string
}

export interface VoteRequest {
  userEmail: string
  userName: string
  bestCategoryId: string
  niceCategoryId: string
  ownCategoryId: string
}

export interface RankingResult {
  category_id: string
  category_name: string
  points: number
  best_votes: number
  nice_votes: number
}

export interface Settings {
  id: string
  key: string
  value: boolean
  updated_at: string
}
