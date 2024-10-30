export type Todo = {
  title: string
  description: string
  completed: boolean
  author: string
  parentId: string
}

export type SharedList = {
  id: string
  title: string
  description: string
  recipientDID: string
  author: string
  todos?: Todo[]
}

export function isTodo(rawData: unknown): Todo {
  const { title, description, completed, author, parentId } = rawData as Todo

  if (includeUndefined([title, description, completed, author, parentId])) {
    throw new Error('unknow type:' + JSON.stringify(rawData))
  }

  if (
    ![title, description, author, parentId]
      .map((s) => isString(s))
      .reduce((p, c) => p && c) ||
    typeof completed !== 'boolean'
  ) {
    throw new Error('unknow type:' + JSON.stringify(rawData))
  }

  return rawData as Todo
}

export function constructSharedList(id: string, rawData: unknown): SharedList {
  const { title, description, author, recipientDID, todos } =
    rawData as SharedList

  if (includeUndefined([title, description, recipientDID, author])) {
    throw new Error('unknow type:' + JSON.stringify(rawData))
  }

  if (
    ![title, description, recipientDID, author]
      .map((s) => isString(s))
      .reduce((p, c) => p && c)
  ) {
    throw new Error('unknow type:' + JSON.stringify(rawData))
  }

  if (todos) {
    todos.map((todo) => isTodo(todo))
  }

  return { id, title, description, author, recipientDID, todos }
}
const isString = (data: unknown) => {
  return typeof data === 'string'
}
const includeUndefined = (list: Array<unknown>) => {
  return list.filter((p) => p === undefined).length > 0
}
