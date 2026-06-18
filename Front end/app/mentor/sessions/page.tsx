import { Suspense } from 'react'
import SessionsPage from './SessionsPage'

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SessionsPage />
        </Suspense>
    )
}
