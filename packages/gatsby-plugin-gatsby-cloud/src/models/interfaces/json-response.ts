export default interface IJSONResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}
