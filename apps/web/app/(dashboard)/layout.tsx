"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "../../components/sidebar";
import { useRequireAuth } from "../../lib/auth-context";
import { api } from "../../lib/api";
import { useI18n } from "../../lib/i18n";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ onboarded: boolean }>("/onboarding/status")
      .then((res) => {
        if (!res.onboarded && pathname !== "/onboarding") {
          router.replace("/onboarding");
        } else {
          setOnboardingChecked(true);
        }
      })
      .catch(() => setOnboardingChecked(true));
  }, [user, pathname, router]);

  if (loading || !user || !onboardingChecked) {
    return <div className="flex h-screen items-center justify-center text-sm text-slate-500">{t("common.loading")}</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
