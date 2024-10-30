import { Web5 } from '@web5/api'
import { todoDwnRepository } from './app/todoDwnRepository'

let repo: todoDwnRepository
let myDid: string
let recipientDID: string

beforeAll(async () => {
  const { web5, did } = await Web5.connect()
  repo = new todoDwnRepository(web5, did)
  console.log(did)
  myDid = did
  recipientDID = did
  await repo.deleteSharedListAll()
}, 600000)
afterEach(async () => {
  await repo.deleteSharedListAll()
})
describe('todoDwnRepositoryは', () => {
  test('createSharedListでtodoリストを作って共有できる', async () => {
    const id = await repo.createSharedList({
      title: 'test todo list',
      description: 'test from jest',
      recipientDID,
    })
    const rec = await repo.readAllSharedList()
    if (rec === undefined) {
      return
    }
    expect(rec[0]).toStrictEqual({
      id,
      title: 'test todo list',
      description: 'test from jest',
      recipientDID,
      author: myDid,
      todos: [],
    })
  })

  test('todoリストにtodoを１つ追加して共有できる', async () => {
    const listId = await repo.createSharedList({
      title: 'test todo list',
      description: 'test from jest',
      recipientDID,
    })

    await repo.addTodo(
      {
        title: 'test todo',
        description: 'test',
        parentId: listId,
        author: myDid,
      },
      recipientDID
    )
    const todolists = await repo.readAllSharedList()
    if (todolists === undefined) {
      return
    }

    expect(todolists[0].todos).toBeDefined()
  })
})
