// app/(public)/jobs/loading.jsx
import { ListingSkeleton } from "@/components/shared/ListingSkeleton";
export default function Loading() {
  return <ListingSkeleton cards={6} cols="lg:grid-cols-2" />;
}

