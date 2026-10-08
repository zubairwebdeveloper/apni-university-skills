// components/layout/PageBreadcrumbs.jsx
// shadcn's BreadcrumbLink would need asChild to use next/link. Instead the Link goes straight inside BreadcrumbItem.
import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function PageBreadcrumbs({ items }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${it.label}-${i}`}>
              <BreadcrumbItem className="max-w-[16rem] truncate">
                {last || !it.href ? (
                  <BreadcrumbPage>{it.label}</BreadcrumbPage>
                ) : (
                  <Link
                    href={it.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {it.label}
                  </Link>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

