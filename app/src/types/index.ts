export interface WishItem {
  id: string
  name: string
  wish: string
  createdAt: number
}

export interface PresetName {
  id: string
  name: string
}

export type PageView = 'admin' | 'lottery' | 'wish-input'
