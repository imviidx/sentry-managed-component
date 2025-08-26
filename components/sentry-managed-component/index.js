var a={};async function s(o,i){console.log("\u{1F3AF} [SERVER] Sentry Managed Component loading with settings:",Object.keys(i)),o.addEventListener("clientcreated",({client:n})=>{console.log("[Sentry CM] Client created, settings:",i),n.execute('console.log("\u{1F680} Hello from Sentry Managed Component!")'),n.execute(`console.log("\u2699\uFE0F MC Settings:", JSON.stringify(${JSON.stringify(i)}, null, 2))`),n.execute(`
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
    `),n.execute(`
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
    `)}),o.addEventListener("consent",async n=>{let{client:e,payload:t}=n;a=t,r(e,a)}),o.addEventListener("clientcreated",({client:n})=>{n.execute(`CM Settings: ${JSON.stringify(i)}`),n.execute(`
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
    `)});function r(n,e){n.execute(`console.log("consentState",${JSON.stringify(e)})`),n.execute(`
      (function() {
        // Store the update function globally so DOM events can call it
        window.__updateSentryConsent = function(newConsentState) {
          const consent = newConsentState || ${JSON.stringify(e)};

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
        window.__updateSentryConsent(${JSON.stringify(e)});
      })();
    `)}o.addEventListener("pageview",async n=>{let{client:e}=n,t=e.get("user_id");t&&e.execute(`
        if (window.Sentry && window.Sentry.setUser) {
          window.Sentry.setUser({ id: '${t}' });
        }
      `),e.execute(`
      if (window.Sentry && window.Sentry.setTag) {
        window.Sentry.setTag('page.url', window.location.href);
        window.Sentry.setTag('page.title', document.title);
      }
    `)}),o.addEventListener("event",async n=>{let{client:e,payload:t}=n;t.name&&a.functional&&e.execute(`
        if (window.Sentry && window.Sentry.addBreadcrumb) {
          window.Sentry.addBreadcrumb({
            message: 'Custom event: ${t.name}',
            category: 'custom',
            level: 'info',
            data: ${JSON.stringify(t)}
          });
        }
      `)})}export{s as default};
