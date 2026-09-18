import { redirect } from "next/navigation";

/**
 * Root route — redirect to /login.
 * Once authenticated, the app can redirect to /dashboard instead.
 */
export default function RootPage() {
  redirect("/login");
}
