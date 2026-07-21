"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useI18n } from "../lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { IconHome, IconChat, IconBook, IconBag, IconChart, IconPlug, IconUsers } from "./icons";

const NAV_ITEMS = [
  { href: "/overview", labelKey: "nav.overview", Icon: IconHome },
  { href: "/inbox", labelKey: "nav.inbox", Icon: IconChat },
  { href: "/knowledge-base", labelKey: "nav.knowledgeBase", Icon: IconBook },
  { href: "/catalog", labelKey: "nav.catalog", Icon: IconBag },
  { href: "/analytics", labelKey: "nav.analytics", Icon: IconChart },
  { href: "/settings/integrations", labelKey: "nav.integrations", Icon: IconPlug },
  { href: "/settings/team", labelKey: "nav.team", Icon: IconUsers },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-e border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <p className="text-lg font-semibold text-brand-700">Conviyo</p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map(({ href, labelKey, Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition ${
                active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-slate-200 p-3">
        <LanguageSwitcher compact />
        <button
          onClick={logout}
          className="w-full rounded-md px-3 py-2 text-start text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          {t("nav.signOut")}
        </button>
      </div>
    </aside>
  );
}
