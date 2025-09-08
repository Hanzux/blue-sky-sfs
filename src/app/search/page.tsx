
'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchResults } from '@/components/search-results';

export default function SearchPage() {
  return (
    <div className="flex justify-center p-4 sm:p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-8 w-1/3 mt-4" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
}
