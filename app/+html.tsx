import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { Analytics } from '@vercel/analytics/react';

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
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, shrink-to-fit=no, user-scalable=yes, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
              }

              html, body {
                margin: 0;
                padding: 0;
                background: #000;
                width: 100%;
                height: 100%;
                overflow: hidden;
              }

              /* Prevent double-tap zoom delay on mobile */
              button, [role="button"], input, textarea, select {
                touch-action: manipulation;
              }

              /* Responsive container - adapts to all screen sizes */
              #root {
                display: flex;
                justify-content: center;
                align-items: stretch;
                min-height: 100dvh;
                width: 100vw;
                background-color: #000;
                overflow: hidden;
              }

              /* Responsive scaling based on viewport width */
              #root > div:first-child {
                width: 100%;
                height: 100%;
                position: relative;
              }

              /* Mobile: full width */
              @media (max-width: 375px) {
                #root > div:first-child {
                  width: 100%;
                  max-width: 100%;
                }
              }

              /* Small phones: nearly full width */
              @media (min-width: 376px) and (max-width: 479px) {
                #root > div:first-child {
                  width: 100%;
                  max-width: 100%;
                }
              }

              /* Standard mobile: constrained width */
              @media (min-width: 480px) and (max-width: 599px) {
                #root {
                  padding: 0;
                }
                #root > div:first-child {
                  max-width: 480px;
                  width: 100%;
                }
              }

              /* Tablets: centered with padding */
              @media (min-width: 600px) and (max-width: 999px) {
                #root {
                  padding: 0 20px;
                }
                #root > div:first-child {
                  max-width: 600px;
                  width: 100%;
                }
              }

              /* Desktop: centered column layout */
              @media (min-width: 1000px) {
                #root {
                  justify-content: center;
                  padding: 0 40px;
                }
                #root > div:first-child {
                  max-width: 720px;
                  width: 100%;
                }
              }

              /* Extra large desktop */
              @media (min-width: 1400px) {
                #root > div:first-child {
                  max-width: 800px;
                }
              }

              /* Ensure safe area (notch) support on mobile web */
              @supports (padding: max(0px)) {
                body {
                  padding-left: max(0px, env(safe-area-inset-left));
                  padding-right: max(0px, env(safe-area-inset-right));
                  padding-top: max(0px, env(safe-area-inset-top));
                  padding-bottom: max(0px, env(safe-area-inset-bottom));
                }
              }

              /* Smooth scrolling */
              html {
                scroll-behavior: smooth;
              }

              /* Prevent text selection issues on mobile */
              input, textarea, select {
                font-size: 16px; /* Prevents zoom on iOS input focus */
              }
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
