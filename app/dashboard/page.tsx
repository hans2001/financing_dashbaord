import { redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { getAuthenticatedUser } from "@/lib/server/session";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardShell />;
}
