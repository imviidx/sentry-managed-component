import { ComponentSettings, Manager } from '@managed-components/types';

interface ConsentState {
  functional?: boolean;
  analytics?: boolean;
  marketing?: boolean;
  preferences?: boolean;
}

let currentConsentState: ConsentState = {};

export default async function (manager: Manager, settings: ComponentSettings) {
  console.log(
    '🎯 [SERVER] Sentry Managed Component loading with settings:',
    Object.keys(settings)
  );

  // Initialize Sentry consent management
  manager.addEventListener('clientcreated', ({ client }) => {
    console.log('[Sentry CM] Client created, settings:', settings);

    // Simple hello world to confirm MC is active
    client.execute(`console.log("🚀 Hello from Sentry Managed Component!")`);
    client.execute(
      `console.log("⚙️ MC Settings:", JSON.stringify(${JSON.stringify(
        settings
      )}, null, 2))`
    );

    // Bridge DOM consent events to WebCM manager events
    client.execute(`
      (function() {
        // Listen for DOM consent events and forward to WebCM
        window.addEventListener('consent', function(event) {
          console.log('[Sentry CM] Received DOM consent event:', event.detail);

          // Forward to WebCM by calling webcm.consent or creating a synthetic event
          if (window.webcm && window.webcm.trigger) {
            window.webcm.trigger('consent', event.detail.payload);
          } else {
            // Fallback: dispatch a synthetic webcm event
            console.log('[Sentry CM] WebCM trigger not available, storing consent in window.__consentState');
            window.__consentState = event.detail.payload;

            // Trigger a manual update if managed component is available
            if (window.__sentryManagedComponent && window.__sentryManagedComponent.updateConsent) {
              window.__sentryManagedComponent.updateConsent(event.detail.payload);
            }
          }
        });

        console.log('[Sentry CM] DOM consent event listener installed');
      })();
    `);

    client.execute(`
      (function() {
        // Check if Sentry is already initialized
        if (typeof window.Sentry !== 'undefined' && window.Sentry.getCurrentHub) {
          const hub = window.Sentry.getCurrentHub();
          const client = hub.getClient();

          if (client && client.getOptions) {
            console.log('[Sentry CM] Existing Sentry instance detected - will manage consent settings');

            // Store original configuration
            const originalOptions = client.getOptions();
            window.__sentryOriginalConfig = {
              autoSessionTracking: originalOptions.autoSessionTracking,
              sendDefaultPii: originalOptions.sendDefaultPii,
              captureUnhandledRejections: originalOptions.captureUnhandledRejections,
              tracesSampleRate: originalOptions.tracesSampleRate,
              profilesSampleRate: originalOptions.profilesSampleRate,
              replaysSessionSampleRate: originalOptions.replaysSessionSampleRate,
              replaysOnErrorSampleRate: originalOptions.replaysOnErrorSampleRate,
              integrations: originalOptions.integrations ? originalOptions.integrations.map(i => i.name || i.constructor.name) : [],
              beforeBreadcrumb: originalOptions.beforeBreadcrumb,
              initialScope: originalOptions.initialScope
            };

            window.__sentryManagedComponent = {
              initialized: true,
              originalConfig: window.__sentryOriginalConfig,
              updateConsent: function(newConsentState) {
                console.log('[Sentry CM] Manual consent update triggered:', newConsentState);
                // This function will be called from the DOM event bridge
                if (window.__updateSentryConsent) {
                  window.__updateSentryConsent(newConsentState);
                }
              }
            };
          } else {
            console.warn('[Sentry CM] Sentry is available but no client found - unable to manage settings');
          }
        } else {
          console.warn('[Sentry CM] No existing Sentry instance found. Please initialize Sentry before loading this Managed Component.');
          console.info('[Sentry CM] Expected: window.Sentry to be available with getCurrentHub() method');
        }
      })();
    `);
  });

  // Handle consent changes
  manager.addEventListener('consent', async (event) => {
    const { client, payload } = event;
    currentConsentState = payload as ConsentState;
    updateSentryConsent(client, currentConsentState);
  });

  // Check for stored consent state on client creation and set up update function
  manager.addEventListener('clientcreated', ({ client }) => {
    client.execute(`CM Settings: ${JSON.stringify(settings)}`);

    client.execute(`
      (function() {
        // Check for stored consent state from DOM events
        if (window.__consentState) {
          console.log('[Sentry CM] Found stored consent state:', window.__consentState);

          // Trigger a synthetic consent event for the managed component
          if (window.webcm && window.webcm.trigger) {
            window.webcm.trigger('consent', window.__consentState);
          }
        }

        // Create the update function that can be called directly
        window.__updateSentryConsent = function(consentState) {
          console.log('[Sentry CM] Direct consent update called:', consentState);
          // This will be defined in the consent handler scope
        };
      })();
    `);
  });

  // Extract consent update logic into a separate function
  function updateSentryConsent(client: any, consentState: ConsentState) {
    client.execute(
      `console.log("consentState",${JSON.stringify(consentState)})`
    );
    client.execute(`
      (function() {
        // Store the update function globally so DOM events can call it
        window.__updateSentryConsent = function(newConsentState) {
          const consent = newConsentState || ${JSON.stringify(consentState)};

          if (!window.Sentry || !window.__sentryManagedComponent || !window.__sentryManagedComponent.initialized) {
            console.warn('[Sentry CM] Sentry not properly initialized for consent management');
            return;
          }

          const originalConfig = window.__sentryOriginalConfig;
          const hub = window.Sentry.getCurrentHub();
          const client = hub.getClient();

          if (!client) {
            console.warn('[Sentry CM] No Sentry client available for configuration update');
            return;
          }

          console.log('[Sentry CM] Updating Sentry configuration based on consent:', consent);

          try {
            // Get current options and create new configuration
            const currentOptions = client.getOptions();
            const newOptions = { ...currentOptions };

            // Core functionality - always respect functional consent
            if (!consent.functional) {
              newOptions.autoSessionTracking = false;
              newOptions.captureUnhandledRejections = false;
              console.log('[Sentry CM] Disabled core tracking features due to functional consent withdrawal');
            } else {
              // Use original developer configuration when consent is granted
              newOptions.autoSessionTracking = originalConfig.autoSessionTracking;
              newOptions.captureUnhandledRejections = originalConfig.captureUnhandledRejections;
            }

            // Analytics consent - affects performance monitoring and metrics
            if (!consent.analytics) {
              newOptions.tracesSampleRate = 0;
              newOptions.profilesSampleRate = 0;
              console.log('[Sentry CM] Disabled performance monitoring due to analytics consent withdrawal');
            } else {
              // Use original developer configuration when consent is granted
              newOptions.tracesSampleRate = originalConfig.tracesSampleRate;
              newOptions.profilesSampleRate = originalConfig.profilesSampleRate;
            }

            // Marketing consent - affects session replay and user behavior tracking
            if (!consent.marketing) {
              newOptions.replaysSessionSampleRate = 0;
              newOptions.replaysOnErrorSampleRate = 0;
              console.log('[Sentry CM] Disabled session replay due to marketing consent withdrawal');
            } else {
              // Use original developer configuration when consent is granted
              newOptions.replaysSessionSampleRate = originalConfig.replaysSessionSampleRate;
              newOptions.replaysOnErrorSampleRate = originalConfig.replaysOnErrorSampleRate;
            }

            // Preferences consent - affects PII and personalized tracking
            if (!consent.preferences) {
              newOptions.sendDefaultPii = false;
              console.log('[Sentry CM] Disabled PII collection due to preferences consent withdrawal');
            } else {
              // Use original developer configuration when consent is granted
              newOptions.sendDefaultPii = originalConfig.sendDefaultPii;
            }

            // Update integrations based on consent - filter out restricted integrations
            let integrations = [...(currentOptions.integrations || [])];

            // Remove integrations based on consent withdrawal
            if (!consent.functional) {
              // Remove core error handling integrations when functional consent is withdrawn
              integrations = integrations.filter(integration => {
                const name = integration.name || integration.constructor.name;
                return !['GlobalHandlers', 'TryCatch', 'LinkedErrors', 'Breadcrumbs', 'HttpContext'].includes(name);
              });
              console.log('[Sentry CM] Removed core integrations due to functional consent withdrawal');
            }

            if (!consent.analytics) {
              // Remove performance monitoring integrations when analytics consent is withdrawn
              integrations = integrations.filter(integration => {
                const name = integration.name || integration.constructor.name;
                return !['BrowserTracing', 'BrowserProfilingIntegration'].includes(name);
              });
              console.log('[Sentry CM] Removed analytics integrations due to analytics consent withdrawal');
            }

            if (!consent.marketing) {
              // Remove replay integrations when marketing consent is withdrawn
              integrations = integrations.filter(integration => {
                const name = integration.name || integration.constructor.name;
                return !['Replay'].includes(name);
              });
              console.log('[Sentry CM] Removed marketing integrations due to marketing consent withdrawal');
            }

            if (!consent.preferences) {
              // Remove personalization integrations when preferences consent is withdrawn
              integrations = integrations.filter(integration => {
                const name = integration.name || integration.constructor.name;
                return !['Dedupe'].includes(name);
              });
              console.log('[Sentry CM] Removed preferences integrations due to preferences consent withdrawal');
            }

            newOptions.integrations = integrations;

            // Re-initialize Sentry with new options
            window.Sentry.init(newOptions);

            console.log('[Sentry CM] Sentry configuration updated successfully');

          } catch (error) {
            console.error('[Sentry CM] Error updating Sentry configuration:', error);
          }
        };

        // Call the update function with current consent state
        window.__updateSentryConsent(${JSON.stringify(consentState)});
      })();
    `);
  }

  // Handle pageview events to ensure Sentry context is updated
  manager.addEventListener('pageview', async (event) => {
    const { client } = event;

    // Update Sentry user context if available
    const userId = client.get('user_id');
    if (userId) {
      client.execute(`
        if (window.Sentry && window.Sentry.setUser) {
          window.Sentry.setUser({ id: '${userId}' });
        }
      `);
    }

    // Set page context
    client.execute(`
      if (window.Sentry && window.Sentry.setTag) {
        window.Sentry.setTag('page.url', window.location.href);
        window.Sentry.setTag('page.title', document.title);
      }
    `);
  });

  // Handle custom events and forward them to Sentry
  manager.addEventListener('event', async (event) => {
    const { client, payload } = event;

    if (payload.name && currentConsentState.functional) {
      client.execute(`
        if (window.Sentry && window.Sentry.addBreadcrumb) {
          window.Sentry.addBreadcrumb({
            message: 'Custom event: ${payload.name}',
            category: 'custom',
            level: 'info',
            data: ${JSON.stringify(payload)}
          });
        }
      `);
    }
  });
}
