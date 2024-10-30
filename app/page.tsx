import TodoForm from './todo-form'

export default function Home() {
  return (
    <div
      className='grid grid-rows-[20px_1fr_20px] justify-items-center
                min-h-screen pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]'
    >
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start'>
        <div>
          <TodoForm />
        </div>
        <div>todo list の場所</div>
      </main>
    </div>
  )
}
