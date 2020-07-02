export interface IPageInfo {
  variables: { [name: string]: unknown }
  hasNextPage: boolean
}

type VariableName = string

export interface IPaginationAdapter<TPage, TItem> {
  name: string
  expectedVariableNames: VariableName[]
  start(): IPageInfo
  next(current: IPageInfo, page: TPage): IPageInfo
  concat(acc: TPage, page: TPage): TPage
  getItems(page: TPage): Array<TItem | null>
}
