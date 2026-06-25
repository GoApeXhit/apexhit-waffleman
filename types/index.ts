export interface WaffleItem {
  id: string
  name: string
  iconUrl: string
  link: string
  type: 'app' | 'website'
  order: number
  createdAt: string
}

export interface WaffleData {
  items: WaffleItem[]
  updatedAt: string
}
