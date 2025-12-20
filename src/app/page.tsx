import { redirect } from "next/navigation";

// This page only handles the root route `/`
// It redirects to the default locale `/en`
export default function RootPage() {
    redirect("/en");
}
