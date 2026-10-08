// app/(public)/courses/loading.jsx
import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="border-b bg-secondary/40">
        <Container className="py-10 sm:py-14">
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        </Container>
      </div>
      <Container className="py-8 sm:py-10">
        <Skeleton className="h-36 w-full" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}

