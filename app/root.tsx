import { Links, Meta, Outlet, Scripts } from "@remix-run/react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="info">
          <a href="https://dexa.ai">
            <img src="/static/dexa-logo.svg" className="logo" alt="Dexa Labs" />
          </a>
          <p>
            Every person mentioned on a Huberman Lab episode.
            <br />
            Select a someone to see who they are connected to.
          </p>
        </header>
        <div className="graph">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
