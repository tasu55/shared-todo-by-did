import { Web5 } from '@web5/api'

import protocolDefinition from './shared-todo-protocol.json'
import { constructSharedList, isTodo, SharedList, Todo } from './todo'

export class todoDwnRepository {
  web5: Web5
  myDid: string
  constructor(w: Web5, did: string) {
    this.web5 = w
    this.myDid = did
  }
  private async configureProtocol() {
    const { protocols, status } = await this.web5.dwn.protocols.query({
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
        },
      },
    })

    if (status.code !== 200) {
      console.error('Error querying protocols', status)
      return
    }

    if (protocols.length > 0) {
      return
    }

    const { status: configureStatus, protocol } =
      await this.web5.dwn.protocols.configure({
        message: {
          definition: protocolDefinition,
        },
      })

    console.log('Protocol configured', configureStatus, protocol)
    if (protocol === undefined) {
      return
    }

    //   const { status: configureRemoteStatus } = await protocol.send(this.myDid)
    //   console.log('Protocol configured on remote DWN', configureRemoteStatus)
  }
  async deleteTodoAll(parentId: string) {
    const { records: todoRecords } = await this.web5.dwn.records.query({
      message: {
        filter: {
          parentId,
        },
      },
    })
    if (todoRecords === undefined) {
      return
    }

    const p = todoRecords.map(async (r) => {
      await this.web5.dwn.records.delete({
        message: {
          recordId: r.id,
        },
      })
    })
    await Promise.all(p)
    return
  }
  async deleteSharedListAll() {
    const lists = await this.readAllSharedList()

    if (lists === undefined) {
      return
    }

    const p = lists.map(async (r) => {
      await this.deleteTodoAll(r.id)
      await this.web5.dwn.records.delete({
        message: {
          recordId: r.id,
        },
      })
    })
    await Promise.all(p)
  }

  async createSharedList(newList: Omit<SharedList, 'author' | 'id'>) {
    await this.configureProtocol()
    const sharedList = {
      '@type': 'list',
      title: newList.title,
      description: newList.description,
      author: this.myDid,
      recipientDID: newList.recipientDID,
    }

    const { record } = await this.web5.dwn.records.create({
      data: sharedList,
      message: {
        protocol: protocolDefinition.protocol,
        protocolPath: 'list',
        schema: protocolDefinition.types.list.schema,
        dataFormat: protocolDefinition.types.list.dataFormats[0],
        recipient: newList.recipientDID,
      },
    })

    if (record === undefined) {
      throw new Error('Unable to create list to target did:' + this.myDid)
    }

    const { status: sendStatus } = await record.send(newList.recipientDID)
    if (sendStatus.code !== 202) {
      throw new Error(
        'Unable to send to target did:' + sendStatus.code + sendStatus.detail
      )
    }

    return record.id
  }

  async fetchTodos(id: string) {
    const { records: todoRecords } = await this.web5.dwn.records.query({
      message: {
        filter: {
          parentId: id,
        },
      },
    })
    if (todoRecords === undefined) {
      return []
    }
    if (todoRecords.length == 0) {
      return []
    }
    const todos = await Promise.all(
      todoRecords.map(async (tr) => {
        const obj = await tr.data.json()
        return isTodo(obj)
      })
    )
    return todos
  }

  async readAllSharedList() {
    const { records } = await this.web5.dwn.records.query({
      message: {
        filter: {
          schema: protocolDefinition.types.list.schema,
        },
        //dateSort: 'createdAscending' DataSort型がちゃんと公開されていないため指定できない
      },
    })
    if (records === undefined) {
      return undefined
    }
    const list = await Promise.all(
      records.map(async (record) => {
        const data = await record.data.json()
        return constructSharedList(record.id, data)
      })
    )

    const promise = list.map(async (sl) => ({
      ...sl,
      todos: await this.fetchTodos(sl.id),
    }))

    return await Promise.all(promise)
  }

  async addTodo(addTodoArg: Omit<Todo, 'completed'>, recipientDid: string) {
    const { record: todoRecord, status: createStatus } =
      await this.web5.dwn.records.create({
        data: { ...addTodoArg, completed: false },
        message: {
          protocol: protocolDefinition.protocol,
          protocolPath: 'list/todo',
          schema: protocolDefinition.types.todo.schema,
          dataFormat: protocolDefinition.types.todo.dataFormats[0],
          parentContextId: addTodoArg.parentId,
        },
      })

    if (todoRecord === undefined) {
      throw new Error(
        'unable to create todo:' + createStatus.code + ':' + createStatus.detail
      )
    }

    const { status: sendStatus } = await todoRecord.send(recipientDid)
    if (sendStatus.code !== 202) {
      throw new Error('Unable to send to target did:' + sendStatus)
    }
    return
  }
}
