export default {
  // The Managed Components to load, with their settings and permissions
  components: [
    {
      name: 'sentry-managed-component',
      settings: {
        // Sentry DSN for automatic initialization
        'sentry-dsn': 'https://5a69d530abb9e2f033b4891b9b67d73c@o4509374586028032.ingest.us.sentry.io/4509477123915776',

        // Consent Settings (these match the consent categories)
        'consent.functional': true,
        'consent.analytics': true,
        'consent.marketing': false,
        'consent.preferences': false,

        // Old attempt with granular settings:

        //// Core Integration Settings
        //'core_integration.auto_session_tracking': true,
        //'core_integration.send_default_pii': false, // Privacy-conscious default
        //'core_integration.capture_unhandled_rejections': true,

        //// Performance Integration Settings
        //'performance_integration.enable_performance': true,
        //'performance_integration.enable_profiling': true,
        //'performance_integration.enable_tracing': true,

        //// Replay Integration Settings
        //'replay_integration.enable_replay': true,
        //'replay_integration.mask_all_text': true,
        //'replay_integration.mask_all_inputs': true,
        //'replay_integration.block_all_media': false,
        //'replay_integration.block_class': 'sentry-block',
        //'replay_integration.mask_class': 'sentry-mask',
        //'replay_integration.ignore_class': 'sentry-ignore',
        //'replay_integration.network_capture_body': false, // Privacy-conscious

        //// Browser Integration Settings
        //'browser_integration.breadcrumbs_console': true,
        //'browser_integration.breadcrumbs_dom': true,
        //'browser_integration.breadcrumbs_fetch': true,
        //'browser_integration.breadcrumbs_history': true,
        //'browser_integration.breadcrumbs_xhr': true,
        //'browser_integration.capture_console': true,
        //'browser_integration.capture_xhr': true,
        //'browser_integration.capture_fetch': true,
        //'browser_integration.capture_click_events': true,
        //'browser_integration.capture_key_events': false, // Privacy-conscious

        //// Advanced Integration Settings
        //'advanced_integration.auto_instrument': true,
        //'advanced_integration.instrument_navigation': true,
        //'advanced_integration.instrument_page_load': true,
        //'advanced_integration.instrument_xhr': true,
        //'advanced_integration.instrument_fetch': true,
        //'advanced_integration.enable_long_task': true,
        //'advanced_integration.enable_INP': true,
        //'advanced_integration.enable_CLS': true,
        //'advanced_integration.enable_LCP': true,
        //'advanced_integration.enable_FID': true,
        //'advanced_integration.enable_TTFB': true,
        //'advanced_integration.enable_FCP': true,

        //// React Integration Settings (for demo)
        //'react_integration.react_error_boundary': true,
        //'react_integration.react_profiler': true,
        //'react_integration.react_router_instrumentation': false, // Not using router in demo
      },
      permissions: [
        'execute_unsafe_scripts',
        'client_network_requests',
        'access_client_kv',
      ],
    },
  ],
  // The target server URL to proxy (Vite dev server)
  target: 'http://localhost:3000',
  // The hostname to which WebCM should bind
  hostname: 'localhost',
  // The tracking URL will get all POST requests coming from `webcm.track`
  trackPath: '/webcm/track',
  // The port WebCM should listen to
  port: 1337,
  // Optional: hash key to make sure cookies set by WebCM aren't tampered with
  cookiesKey: 'sentry-managed-component-secret-key',
};
