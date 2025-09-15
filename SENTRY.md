# Sentry Managed Component Configuration Parameters

This document provides a comprehensive overview of all Sentry SDK configuration parameters that can be used in the managed component.

## Consent Management & Purpose Mapping

The Sentry Managed Component integrates with Zaraz consent management to ensure GDPR compliance. By default, it uses standard Zaraz purpose IDs, but these can be customized to match your specific consent management setup.

### Default Purpose Mapping

| Consent Type  | Default Purpose ID | Description                                                                           |
| ------------- | ------------------ | ------------------------------------------------------------------------------------- |
| `functional`  | `lFDj`             | Required for Sentry error tracking and debugging features (Essential/Necessary)       |
| `analytics`   | `yybb`             | Controls performance monitoring and analytics (Performance & Statistics)              |
| `marketing`   | `rlae`             | Controls user tracking and marketing-related features (Advertising & Personalization) |
| `preferences` | `hfWn`             | Controls user preference tracking (Personalization & Settings)                        |

### Custom Purpose Mapping

You can configure custom purpose IDs when initializing the Sentry integration:

```javascript
// Example with custom purpose mapping
sentryZarazIntegration({
  timeout: 10000,
  debug: false,
  purposeMapping: {
    functional: 'custom-functional-id',
    analytics: 'custom-analytics-id',
    marketing: 'custom-marketing-id',
    preferences: 'custom-preferences-id',
  },
});
```

For detailed examples and usage instructions, see [CUSTOM_PURPOSE_MAPPING.md](./CUSTOM_PURPOSE_MAPPING.md).

## Core Configuration Parameters

| Parameter                      | Type    | Default      | Description                                               | Is Managed | Namespace                                |
| ------------------------------ | ------- | ------------ | --------------------------------------------------------- | ---------- | ---------------------------------------- |
| `dsn`                          | string  | -            | Your Sentry project DSN from sentry.io                    | ❌         | `sentry-cm.dsn`                          |
| `environment`                  | string  | "production" | Environment name (e.g., production, staging, development) | ❌         | `sentry-cm.environment`                  |
| `release`                      | string  | -            | Release version for tracking deployments                  | ❌         | `sentry-cm.release`                      |
| `sample_rate`                  | number  | 1.0          | Percentage of errors to capture (0.0 to 1.0)              | ❌         | `sentry-cm.sample_rate`                  |
| `debug`                        | boolean | false        | Enable debug logging for troubleshooting                  | ❌         | `sentry-cm.debug`                        |
| `auto_session_tracking`        | boolean | true         | Automatically track user sessions                         | ✅         | `sentry-cm.auto_session_tracking`        |
| `send_default_pii`             | boolean | false        | Include personally identifiable information in events     | ✅         | `sentry-cm.send_default_pii`             |
| `attach_stacktrace`            | boolean | true         | Attach stack traces to non-error events                   | ❌         | `sentry-cm.attach_stacktrace`            |
| `max_breadcrumbs`              | number  | 100          | Maximum number of breadcrumbs to keep                     | ❌         | `sentry-cm.max_breadcrumbs`              |
| `capture_unhandled_rejections` | boolean | true         | Capture unhandled promise rejections                      | ✅         | `sentry-cm.capture_unhandled_rejections` |
| `normalize_depth`              | number  | 3            | Maximum depth for normalizing event data                  | ❌         | `sentry-cm.normalize_depth`              |
| `max_value_length`             | number  | 250          | Maximum length of event values                            | ❌         | `sentry-cm.max_value_length`             |
| `server_name`                  | string  | -            | Server name to be reported with events                    | ❌         | `sentry-cm.server_name`                  |
| `shutdown_timeout`             | number  | 2000         | Maximum time to wait for pending events on shutdown (ms)  | ❌         | `sentry-cm.shutdown_timeout`             |

## Performance Monitoring

| Parameter                   | Type    | Default | Description                                            | Is Managed | Namespace                             |
| --------------------------- | ------- | ------- | ------------------------------------------------------ | ---------- | ------------------------------------- |
| `enable_performance`        | boolean | true    | Enable performance monitoring                          | ✅         | `sentry-cm.enable_performance`        |
| `traces_sample_rate`        | number  | 0.1     | Percentage of transactions to trace (0.0 to 1.0)       | ❌         | `sentry-cm.traces_sample_rate`        |
| `traces_sampler`            | string  | -       | Custom function name for dynamic trace sampling        | ❌         | `sentry-cm.traces_sampler`            |
| `enable_profiling`          | boolean | false   | Enable JavaScript profiling for performance insights   | ✅         | `sentry-cm.enable_profiling`          |
| `profiles_sample_rate`      | number  | 0.1     | Percentage of transactions to profile (0.0 to 1.0)     | ❌         | `sentry-cm.profiles_sample_rate`      |
| `profiles_sampler`          | string  | -       | Custom function name for dynamic profile sampling      | ❌         | `sentry-cm.profiles_sampler`          |
| `trace_propagation_targets` | text    | -       | Comma-separated list of URLs to add tracing headers to | ❌         | `sentry-cm.trace_propagation_targets` |
| `enable_tracing`            | boolean | true    | Enable distributed tracing                             | ✅         | `sentry-cm.enable_tracing`            |

## Session Replay

| Parameter                     | Type    | Default         | Description                                          | Is Managed | Namespace                               |
| ----------------------------- | ------- | --------------- | ---------------------------------------------------- | ---------- | --------------------------------------- |
| `enable_replay`               | boolean | false           | Record user sessions for debugging                   | ✅         | `sentry-cm.enable_replay`               |
| `replay_sample_rate`          | number  | 0.1             | Percentage of sessions to record (0.0 to 1.0)        | ❌         | `sentry-cm.replay_sample_rate`          |
| `replay_on_error_sample_rate` | number  | 1.0             | Percentage of error sessions to record (0.0 to 1.0)  | ❌         | `sentry-cm.replay_on_error_sample_rate` |
| `mask_all_text`               | boolean | true            | Mask all text content in session replays for privacy | ✅         | `sentry-cm.mask_all_text`               |
| `mask_all_inputs`             | boolean | true            | Mask all input values in session replays             | ✅         | `sentry-cm.mask_all_inputs`             |
| `block_all_media`             | boolean | true            | Block all media elements in session replays          | ✅         | `sentry-cm.block_all_media`             |
| `block_class`                 | string  | "sentry-block"  | CSS class to block elements from replay              | ✅         | `sentry-cm.block_class`                 |
| `mask_class`                  | string  | "sentry-mask"   | CSS class to mask elements in replay                 | ✅         | `sentry-cm.mask_class`                  |
| `ignore_class`                | string  | "sentry-ignore" | CSS class to ignore elements in replay               | ✅         | `sentry-cm.ignore_class`                |
| `network_detail_allowed_urls` | text    | -               | Comma-separated URLs to include network details for  | ✅         | `sentry-cm.network_detail_allowed_urls` |
| `network_detail_denied_urls`  | text    | -               | Comma-separated URLs to exclude network details for  | ✅         | `sentry-cm.network_detail_denied_urls`  |
| `network_capture_body`        | boolean | true            | Capture request/response bodies in replay            | ✅         | `sentry-cm.network_capture_body`        |
| `network_request_headers`     | text    | -               | Comma-separated request headers to capture           | ✅         | `sentry-cm.network_request_headers`     |
| `network_response_headers`    | text    | -               | Comma-separated response headers to capture          | ✅         | `sentry-cm.network_response_headers`    |

## Error Filtering & Processing

| Parameter                 | Type   | Default | Description                                                    | Is Managed | Namespace                           |
| ------------------------- | ------ | ------- | -------------------------------------------------------------- | ---------- | ----------------------------------- |
| `before_send`             | string | -       | JavaScript function name to filter events before sending       | ❌         | `sentry-cm.before_send`             |
| `before_send_transaction` | string | -       | JavaScript function name to filter transactions before sending | ❌         | `sentry-cm.before_send_transaction` |
| `before_breadcrumb`       | string | -       | JavaScript function name to filter breadcrumbs                 | ✅         | `sentry-cm.before_breadcrumb`       |
| `ignore_errors`           | text   | -       | Comma-separated list of error messages or patterns to ignore   | ❌         | `sentry-cm.ignore_errors`           |
| `ignore_transactions`     | text   | -       | Comma-separated list of transaction names to ignore            | ❌         | `sentry-cm.ignore_transactions`     |
| `deny_urls`               | text   | -       | Comma-separated list of URLs to exclude from error reporting   | ❌         | `sentry-cm.deny_urls`               |
| `allowed_urls`            | text   | -       | Comma-separated list of URLs to include in error reporting     | ❌         | `sentry-cm.allowed_urls`            |

## Browser Integration Settings

| Parameter                      | Type    | Default | Description                               | Is Managed | Namespace                                |
| ------------------------------ | ------- | ------- | ----------------------------------------- | ---------- | ---------------------------------------- |
| `breadcrumbs_console`          | boolean | true    | Capture console logs as breadcrumbs       | ✅         | `sentry-cm.breadcrumbs_console`          |
| `breadcrumbs_dom`              | boolean | true    | Capture DOM interactions as breadcrumbs   | ✅         | `sentry-cm.breadcrumbs_dom`              |
| `breadcrumbs_fetch`            | boolean | true    | Capture fetch requests as breadcrumbs     | ✅         | `sentry-cm.breadcrumbs_fetch`            |
| `breadcrumbs_history`          | boolean | true    | Capture navigation changes as breadcrumbs | ✅         | `sentry-cm.breadcrumbs_history`          |
| `breadcrumbs_sentry`           | boolean | true    | Capture Sentry events as breadcrumbs      | ❌         | `sentry-cm.breadcrumbs_sentry`           |
| `breadcrumbs_xhr`              | boolean | true    | Capture XHR requests as breadcrumbs       | ✅         | `sentry-cm.breadcrumbs_xhr`              |
| `capture_console`              | boolean | false   | Capture console errors/warnings as events | ✅         | `sentry-cm.capture_console`              |
| `capture_xhr`                  | boolean | true    | Capture failed HTTP requests as events    | ✅         | `sentry-cm.capture_xhr`                  |
| `capture_fetch`                | boolean | true    | Capture failed fetch requests as events   | ✅         | `sentry-cm.capture_fetch`                |
| `capture_unhandled_rejections` | boolean | true    | Capture unhandled promise rejections      | ✅         | `sentry-cm.capture_unhandled_rejections` |
| `capture_click_events`         | boolean | false   | Capture click events for error context    | ✅         | `sentry-cm.capture_click_events`         |
| `capture_key_events`           | boolean | false   | Capture key events for error context      | ✅         | `sentry-cm.capture_key_events`           |

## Context & User Data

| Parameter                   | Type   | Default | Description                                              | Is Managed | Namespace                             |
| --------------------------- | ------ | ------- | -------------------------------------------------------- | ---------- | ------------------------------------- |
| `initial_scope_user`        | text   | -       | JSON string for initial user context                     | ✅         | `sentry-cm.initial_scope_user`        |
| `initial_scope_tags`        | text   | -       | JSON string for initial tags                             | ❌         | `sentry-cm.initial_scope_tags`        |
| `initial_scope_contexts`    | text   | -       | JSON string for initial contexts                         | ❌         | `sentry-cm.initial_scope_contexts`    |
| `initial_scope_level`       | string | "error" | Initial scope level (debug, info, warning, error, fatal) | ❌         | `sentry-cm.initial_scope_level`       |
| `initial_scope_fingerprint` | text   | -       | Comma-separated fingerprint for grouping                 | ❌         | `sentry-cm.initial_scope_fingerprint` |

## Transport & Delivery

| Parameter                            | Type    | Default | Description                                      | Is Managed | Namespace                                      |
| ------------------------------------ | ------- | ------- | ------------------------------------------------ | ---------- | ---------------------------------------------- |
| `tunnel`                             | string  | -       | URL to proxy Sentry requests through your server | ❌         | `sentry-cm.tunnel`                             |
| `transport_options_headers`          | text    | -       | JSON string for additional transport headers     | ❌         | `sentry-cm.transport_options_headers`          |
| `transport_options_fetch_parameters` | text    | -       | JSON string for fetch request parameters         | ❌         | `sentry-cm.transport_options_fetch_parameters` |
| `send_client_reports`                | boolean | true    | Send client usage reports to Sentry              | ❌         | `sentry-cm.send_client_reports`                |

## Advanced Integration Controls

| Parameter               | Type    | Default | Description                                  | Is Managed | Namespace                         |
| ----------------------- | ------- | ------- | -------------------------------------------- | ---------- | --------------------------------- |
| `auto_instrument`       | boolean | true    | Automatically instrument supported libraries | ✅         | `sentry-cm.auto_instrument`       |
| `instrument_navigation` | boolean | true    | Instrument navigation timing                 | ✅         | `sentry-cm.instrument_navigation` |
| `instrument_page_load`  | boolean | true    | Instrument page load timing                  | ✅         | `sentry-cm.instrument_page_load`  |
| `instrument_xhr`        | boolean | true    | Instrument XHR requests                      | ✅         | `sentry-cm.instrument_xhr`        |
| `instrument_fetch`      | boolean | true    | Instrument fetch requests                    | ✅         | `sentry-cm.instrument_fetch`      |
| `enable_long_task`      | boolean | true    | Capture long task performance entries        | ✅         | `sentry-cm.enable_long_task`      |
| `enable_INP`            | boolean | true    | Capture Interaction to Next Paint metrics    | ✅         | `sentry-cm.enable_INP`            |
| `enable_CLS`            | boolean | true    | Capture Cumulative Layout Shift metrics      | ✅         | `sentry-cm.enable_CLS`            |
| `enable_LCP`            | boolean | true    | Capture Largest Contentful Paint metrics     | ✅         | `sentry-cm.enable_LCP`            |
| `enable_FID`            | boolean | true    | Capture First Input Delay metrics            | ✅         | `sentry-cm.enable_FID`            |
| `enable_TTFB`           | boolean | true    | Capture Time to First Byte metrics           | ✅         | `sentry-cm.enable_TTFB`           |
| `enable_FCP`            | boolean | true    | Capture First Contentful Paint metrics       | ✅         | `sentry-cm.enable_FCP`            |

## Framework-Specific Extensions

### React Integration

| Parameter                      | Type    | Default | Description                         | Is Managed | Namespace                                |
| ------------------------------ | ------- | ------- | ----------------------------------- | ---------- | ---------------------------------------- |
| `react_error_boundary`         | boolean | true    | Capture React error boundary errors | ✅         | `sentry-cm.react_error_boundary`         |
| `react_profiler`               | boolean | false   | Enable React profiler integration   | ✅         | `sentry-cm.react_profiler`               |
| `react_router_instrumentation` | boolean | true    | Instrument React Router navigation  | ✅         | `sentry-cm.react_router_instrumentation` |

### Vue Integration

| Parameter                    | Type    | Default | Description                          | Is Managed | Namespace                              |
| ---------------------------- | ------- | ------- | ------------------------------------ | ---------- | -------------------------------------- |
| `vue_error_handler`          | boolean | true    | Capture Vue error handler errors     | ✅         | `sentry-cm.vue_error_handler`          |
| `vue_warn_handler`           | boolean | false   | Capture Vue warning handler warnings | ✅         | `sentry-cm.vue_warn_handler`           |
| `vue_router_instrumentation` | boolean | true    | Instrument Vue Router navigation     | ✅         | `sentry-cm.vue_router_instrumentation` |

### Angular Integration

| Parameter                        | Type    | Default | Description                          | Is Managed | Namespace                                  |
| -------------------------------- | ------- | ------- | ------------------------------------ | ---------- | ------------------------------------------ |
| `angular_error_handler`          | boolean | true    | Capture Angular error handler errors | ✅         | `sentry-cm.angular_error_handler`          |
| `angular_router_instrumentation` | boolean | true    | Instrument Angular Router navigation | ✅         | `sentry-cm.angular_router_instrumentation` |

## Legend

- **✅ Is Managed**: These parameters should be controlled by Zaraz consent settings. When consent is denied for certain purposes, these features should be disabled.
- **❌ Not Managed**: These parameters are technical configurations that don't depend on user consent and should remain active regardless of consent status.

## Consent Management Logic

Parameters marked as "Is Managed" should follow this logic:

1. **Analytics Consent**: Controls performance monitoring, profiling, and related metrics
2. **Marketing Consent**: Controls session replay, user tracking, and PII collection
3. **Functional Consent**: Controls breadcrumbs, error capture, and debugging features

When consent is withdrawn for a specific purpose, the related managed parameters should be disabled or set to privacy-preserving defaults.
