// app/(public)/courses/[slug]/loading.jsx
import { Container } from "@/components/layout/Container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="border-b bg-secondary/40">
        <Container className="space-y-4 py-12">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </Container>
      </div>
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_24rem]">
        <Skeleton className="h-96 w-full lg:order-last" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-56 w-full" />
        </div>
      </Container>
    </>
  );
}
