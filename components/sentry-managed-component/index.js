var a={};async function s(o,e){console.log("\u{1F3AF} [SERVER] Sentry Managed Component loading with settings:",Object.keys(e)),o.addEventListener("clientcreated",({client:n})=>{console.log("[Sentry CM] Client created, settings:",e),n.execute('console.log("\u{1F680} Hello from Sentry Managed Component!")'),n.execute(`console.log("\u2699\uFE0F MC Settings:", JSON.stringify(${JSON.stringify(e)}, null, 2))`),n.execute(`
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
    `)}),o.addEventListener("consent",async n=>{let{client:t,payload:i}=n;a=i,r(t,a)}),o.addEventListener("clientcreated",({client:n})=>{n.execute(`CM Settings: ${JSON.stringify(e)}`),n.execute(`
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
    `)});function r(n,t){n.execute(`console.log("consentState",${JSON.stringify(t)})`),n.execute(`
      (function() {
        // Store the update function globally so DOM events can call it
        window.__updateSentryConsent = function(newConsentState) {
          const consent = newConsentState || ${JSON.stringify(t)};

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
              newOptions.autoSessionTracking = originalConfig.autoSessionTracking !== undefined ? originalConfig.autoSessionTracking : ${e["core_integration.auto_session_tracking"]||!0};
              newOptions.captureUnhandledRejections = originalConfig.captureUnhandledRejections !== undefined ? originalConfig.captureUnhandledRejections : ${e["core_integration.capture_unhandled_rejections"]||!0};
            }

            // Analytics consent - affects PII and detailed tracking
            if (!consent.analytics) {
              newOptions.sendDefaultPii = false;
              console.log('[Sentry CM] Disabled PII collection due to analytics consent withdrawal');
            } else {
              newOptions.sendDefaultPii = originalConfig.sendDefaultPii !== undefined ? originalConfig.sendDefaultPii : ${e["core_integration.send_default_pii"]||!0};
            }

            // Performance consent - affects performance monitoring and profiling
            if (!consent.performance) {
              newOptions.tracesSampleRate = 0;
              newOptions.profilesSampleRate = 0;
              console.log('[Sentry CM] Disabled performance monitoring due to performance consent withdrawal');
            } else {
              newOptions.tracesSampleRate = originalConfig.tracesSampleRate !== undefined ? originalConfig.tracesSampleRate : (${e["performance_integration.enable_performance"]||!0} ? 1.0 : 0);
              newOptions.profilesSampleRate = originalConfig.profilesSampleRate !== undefined ? originalConfig.profilesSampleRate : (${e["performance_integration.enable_profiling"]||!0} ? 1.0 : 0);
            }

            // Marketing consent - affects session replay
            if (!consent.marketing) {
              newOptions.replaysSessionSampleRate = 0;
              newOptions.replaysOnErrorSampleRate = 0;
              console.log('[Sentry CM] Disabled session replay due to marketing consent withdrawal');
            } else {
              newOptions.replaysSessionSampleRate = ${e["replay_integration.enable_replay"]||!0} ? 0.1 : 0;
              newOptions.replaysOnErrorSampleRate = ${e["replay_integration.enable_replay"]||!0} ? 1.0 : 0;
            }

            // Update integrations based on consent
            const integrations = [];
            const integrationNames = originalConfig.integrations || [];

            // Always include error handling if functional consent is given
            if (consent.functional) {
              integrationNames.forEach(name => {
                if (['GlobalHandlers', 'TryCatch', 'LinkedErrors'].includes(name)) {
                  // These are core error handling integrations - keep them
                  const integration = currentOptions.integrations?.find(i => (i.name || i.constructor.name) === name);
                  if (integration) integrations.push(integration);
                }
              });
            }

            // Performance integrations
            if (consent.performance) {
              integrationNames.forEach(name => {
                if (['BrowserTracing', 'BrowserProfilingIntegration'].includes(name)) {
                  const integration = currentOptions.integrations?.find(i => (i.name || i.constructor.name) === name);
                  if (integration) integrations.push(integration);
                }
              });
            }

            // Analytics integrations (breadcrumbs, etc.)
            if (consent.analytics) {
              integrationNames.forEach(name => {
                if (['Breadcrumbs', 'HttpContext', 'Dedupe'].includes(name)) {
                  const integration = currentOptions.integrations?.find(i => (i.name || i.constructor.name) === name);
                  if (integration) integrations.push(integration);
                }
              });
            }

            // Marketing integrations (replay)
            if (consent.marketing) {
              integrationNames.forEach(name => {
                if (['Replay'].includes(name)) {
                  const integration = currentOptions.integrations?.find(i => (i.name || i.constructor.name) === name);
                  if (integration) integrations.push(integration);
                }
              });
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
        window.__updateSentryConsent(${JSON.stringify(t)});
      })();
    `)}o.addEventListener("pageview",async n=>{let{client:t}=n,i=t.get("user_id");i&&t.execute(`
        if (window.Sentry && window.Sentry.setUser) {
          window.Sentry.setUser({ id: '${i}' });
        }
      `),t.execute(`
      if (window.Sentry && window.Sentry.setTag) {
        window.Sentry.setTag('page.url', window.location.href);
        window.Sentry.setTag('page.title', document.title);
      }
    `)}),o.addEventListener("event",async n=>{let{client:t,payload:i}=n;i.name&&a.functional&&t.execute(`
        if (window.Sentry && window.Sentry.addBreadcrumb) {
          window.Sentry.addBreadcrumb({
            message: 'Custom event: ${i.name}',
            category: 'custom',
            level: 'info',
            data: ${JSON.stringify(i)}
          });
        }
      `)})}export{s as default};
