import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * Custom HTML shell for Expo Router's web export.
 * Centers the app in a max-width column on wide screens — giving it a
 * "mobile app in a browser" look without touching the React-Native-side
 * navigator tree at all.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body { margin: 0; padding: 0; background: #000; }

              /* Center the RN root in a 480 px column on wide screens */
              #root {
                display: flex;
                justify-content: center;
                min-height: 100dvh;
                background-color: #000;
              }
              #root > div:first-child {
                width: 100%;
                max-width: 480px;
                position: relative;
              }
            `,
          }}
        />
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
