import { Suspense } from 'react'
import PostInternshipPage from './PostInternshipPage'

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PostInternshipPage />
        </Suspense>
    )
}