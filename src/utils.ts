export const queryToCommaSeparatedString = (query: string | string[] | undefined): string | undefined => {
  if (query == null) { return undefined }
  if (typeof query === 'string') { return query }
  if (query instanceof Array) { return query.join(',') }
  return undefined
}
