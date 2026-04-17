import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { OnboardingGate } from "@/components/OnboardingGate";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "dailyhub" },
      { name: "description", content: "Daily Hub is a unified smart service platform integrating transport, food, healthcare, home services, and payments into one dashboard." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "dailyhub" },
      { property: "og:description", content: "Daily Hub is a unified smart service platform integrating transport, food, healthcare, home services, and payments into one dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "dailyhub" },
      { name: "twitter:description", content: "Daily Hub is a unified smart service platform integrating transport, food, healthcare, home services, and payments into one dashboard." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0e44e043-da3f-4698-999b-cbf1f9aece90/id-preview-226a187d--33333b4b-c8aa-42d2-a6e4-c9def263eaee.lovable.app-1776436889009.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0e44e043-da3f-4698-999b-cbf1f9aece90/id-preview-226a187d--33333b4b-c8aa-42d2-a6e4-c9def263eaee.lovable.app-1776436889009.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <OnboardingGate>
        <Outlet />
      </OnboardingGate>
    </AuthProvider>
  );
}
