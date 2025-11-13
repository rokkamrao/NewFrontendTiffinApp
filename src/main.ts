import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

// Bootstrap lifecycle logging
console.log('[Bootstrap] Starting bootstrapApplication at', new Date().toISOString());
bootstrapApplication(AppComponent, appConfig)
  .then((ref) => {
    const rootCmp = ref.components?.[0]?.instance as any;
    const rootName = rootCmp?.constructor?.name ?? 'UnknownRootComponent';
    console.log('[Bootstrap] Application bootstrapped successfully:', rootName);
  })
  .catch((err) => {
    console.error('[Bootstrap] Failed to bootstrap application', err);
  });
