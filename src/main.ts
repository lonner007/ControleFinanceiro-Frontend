import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

type HotjarFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    hj?: HotjarFunction;
    _hjSettings?: { hjid: string; hjsv: number };
  }
}

function injectScript(id: string, src: string, async = true): void {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = async;
  document.head.appendChild(script);
}

function enableGoogleAnalytics(measurementId: string): void {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId);
  injectScript('google-analytics-src', `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
}

function enableHotjar(siteId: string, version: number): void {
  window._hjSettings = { hjid: siteId, hjsv: version };

  const hotjar = ((...args: unknown[]) => {
    hotjar.q = hotjar.q ?? [];
    hotjar.q.push(args);
  }) as HotjarFunction;

  window.hj = window.hj ?? hotjar;

  injectScript(
    'hotjar-src',
    `https://static.hotjar.com/c/hotjar-${siteId}.js?sv=${version}`,
  );
}

bootstrapApplication(App, appConfig)
  .then(() => {
    if (!environment.production) {
      return;
    }

    if (environment.googleAnalyticsId) {
      enableGoogleAnalytics(environment.googleAnalyticsId);
    }

    if (environment.hotjarSiteId) {
      enableHotjar(environment.hotjarSiteId, environment.hotjarVersion ?? 6);
    }
  })
  .catch((err) => console.error(err));
