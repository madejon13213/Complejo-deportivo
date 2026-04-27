"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Spinner from "@/app/components/UI/Spinner";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth?tab=login");
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Spinner />
    </div>
  );
}
