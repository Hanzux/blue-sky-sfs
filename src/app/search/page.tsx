
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { searchAll } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type SearchResult = {
  learners: { id: string; name: string }[];
  schools: { id: string; name: string }[];
  foodItems: { id: string; name: string }[];
  users: { uid: string; name?: string; email?: string }[];
  caregivers: { id: string; name: string }[];
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setResults({ learners: [], schools: [], foodItems: [], users: [], caregivers: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      const searchResults = await searchAll(query);
      setResults(searchResults);
      setLoading(false);
    }
    performSearch();
  }, [query]);

  const resultCount = results
    ? Object.values(results).reduce((acc,- val) => acc + val.length, 0)
    : 0;

  return (
    <div className="flex justify-center p-4 sm:p-6">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          {query && !loading && (
            <p className="text-sm text-muted-foreground">
              Found {resultCount} results for &quot;{query}&quot;
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-8 w-1/3 mt-4" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : !query ? (
             <Alert>
                <SearchX className="h-4 w-4" />
                <AlertTitle>No Search Query</AlertTitle>
                <AlertDescription>
                  Please enter a search term in the navigation bar to begin.
                </AlertDescription>
            </Alert>
          ) : resultCount === 0 ? (
            <Alert>
              <SearchX className="h-4 w-4" />
              <AlertTitle>No Results Found</AlertTitle>
              <AlertDescription>
                Your search for &quot;{query}&quot; did not return any results.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {results?.learners && results.learners.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Learners</h3>
                  <ul className="space-y-2">
                    {results.learners.map(item => (
                      <li key={`learner-${item.id}`} className="border-b pb-2">
                        <Link href="/dashboard/learner-enrollment" className="text-primary hover:underline">{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {results?.schools && results.schools.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Schools</h3>
                  <ul className="space-y-2">
                    {results.schools.map(item => (
                      <li key={`school-${item.id}`} className="border-b pb-2">
                         <Link href="/dashboard/school-registration" className="text-primary hover:underline">{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {results?.foodItems && results.foodItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Food Items</h3>
                  <ul className="space-y-2">
                    {results.foodItems.map(item => (
                      <li key={`food-${item.id}`} className="border-b pb-2">
                        <Link href="/dashboard/food-items" className="text-primary hover:underline">{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {results?.users && results.users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Users</h3>
                  <ul className="space-y-2">
                    {results.users.map(item => (
                      <li key={`user-${item.uid}`} className="border-b pb-2 flex justify-between items-center">
                        <Link href="/admin/users" className="text-primary hover:underline">{item.name || item.email}</Link>
                         {item.email && <Badge variant="secondary">{item.email}</Badge>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {results?.caregivers && results.caregivers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Caregivers</h3>
                  <ul className="space-y-2">
                    {results.caregivers.map(item => (
                      <li key={`caregiver-${item.id}`} className="border-b pb-2">
                        <Link href="/admin/caregivers" className="text-primary hover:underline">{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
