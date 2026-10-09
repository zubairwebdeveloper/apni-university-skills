// components/admin/admin-users/EditAdminLoader.jsx
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/firebase/client/auth";
import { getAdmin } from "@/services/admin/adminUsersClient";
import { AdminUserForm } from "./AdminUserForm";

function FormSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        <Skeleton className="h-16 rounded-none" />
        <CardContent className="space-y-3 p-5">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
        </CardContent>
      </Card>
    </div>
  );
}

export function EditAdminLoader({ email }) {
  const [state, setState] = useState({ loading: true, admin: null, error: "" });

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      if (!user) {
        setState({
          loading: false,
          admin: null,
          error: "Please sign in first.",
        });
        return;
      }

      try {
        const admin = await getAdmin(email);
        if (!active) return;
        setState({
          loading: false,
          admin,
          error: admin ? "" : "This admin was not found.",
        });
      } catch (e) {
        if (!active) return;
        setState({ loading: false, admin: null, error: e.message });
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [email]);

  if (state.loading) return <FormSkeleton />;

  if (state.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />
          <AlertTitle>Couldn&apos;t load this admin</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return <AdminUserForm mode="edit" initial={state.admin} />;
}
