export interface ContentfulCollection<T> {
  total: number
  skip: number
  limit: number
  items: Array<T>
}
