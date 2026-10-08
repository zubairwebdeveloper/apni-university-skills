// app/(public)/blog/loading.jsx
import { ListingSkeleton } from "@/components/shared/ListingSkeleton";
export default function Loading() {
  return <ListingSkeleton cards={6} />;
}

