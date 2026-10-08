// app/not-found.jsx: also covers notFound() from every page. Includes the navbar because it lives outside the (public) layout.
import Link from "next/link";
import { FiCompass } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
]      <main id="main">
        <Container className="py-24">
          <EmptyState
            icon={FiCompass}
            title="We couldn't find that page"
            description="It may have moved, or the link may be wrong. Try one of these instead."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/" className={buttonVariants()}>
                  Go home
                </Link>
                <Link
                  href="/courses"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Browse courses
                </Link>
              </div>
            }
          />
        </Container>
      </main>
\    </>
  );
}

