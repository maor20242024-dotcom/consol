import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();
    const user = await stackServerApp.getUser();

    // Check if we are on a public page (login or landing)
    // We can't use usePathname here (server component), so we rely on metadata/usage patterns
    // Actually, in Next.js 15+, we rely on middleware for redirection, but we can add a safety check
    // However, if we redirect here, we must be careful not to create a loop for the login page itself.

    return (
        <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="manifest" href="/site.webmanifest" />
            </head>
            <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
                <StackProvider app={stackServerApp}>
                    <StackTheme>
                        <NextIntlClientProvider locale={locale} messages={messages}>
                            <div className="flex h-screen overflow-hidden">
                                {/* Sidebar (Start) */}
                                <AppSidebar />

                                {/* Main Content Area */}
                                <main className="flex-1 overflow-auto relative">
                                    {children}
                                </main>

                                <Toaster />
                            </div>
                        </NextIntlClientProvider>
                    </StackTheme>
                </StackProvider>
            </body>
        </html>
    );
}