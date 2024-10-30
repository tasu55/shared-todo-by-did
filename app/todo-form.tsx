'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { Todo } from './todo'
export default function TodoForm() {
  const { register, handleSubmit } = useForm<Todo>()
  const onSubmit: SubmitHandler<Todo> = (data: Todo) => console.log(data)

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className='flex-column gap-2'>
          <p>Goal Title</p>
          <input
            type='text'
            className='border w-100'
            defaultValue='test'
            {...register('title')}
          />
        </label>
        <label className='flex-column gap-2'>
          <p>Description</p>
          <input
            type='text'
            className='border w-100'
            defaultValue='test'
            {...register('description')}
          />
        </label>
        <label className='flex-column gap-2'>
          <p>Recipient&apos;s DID:</p>
          <input
            type='text'
            className='border w-100'
            defaultValue='test'
            {...register('recipientDID')}
          />
        </label>
        <input type='submit' />
      </form>
    </>
  )
}
