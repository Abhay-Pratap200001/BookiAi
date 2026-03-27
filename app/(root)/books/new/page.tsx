import UploadForm from '@/components/UploadForm'
import React from 'react'

const page = () => {
  return (
    <main className='wrapper container'>
        <div className='mx-auto max-w-180 space-y-10'>
            <section className='flex flex-col gap-5'>
                <h1 className='page-title-xl'>Add a new Book</h1>
                <p className='submit'>
                    Upload a book PDF to genrate your interactive interview
                </p>
            </section>

            <UploadForm/>
        </div>
    </main>
  )
}

export default page
