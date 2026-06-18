import { Suspense } from 'react';
import ApplicationsPage from './ApplicationsPage';
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationsPage />
    </Suspense>
  );
}