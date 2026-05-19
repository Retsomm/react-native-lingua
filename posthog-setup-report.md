<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Lingua language learning Expo app. The following changes were made:

- **`app.config.js`** — Created to replace `app.json`, adding PostHog token and host via `extra` config so they are accessible through `expo-constants`.
- **`lib/posthog.ts`** — Created a shared PostHog client instance configured via `Constants.expoConfig?.extra`.
- **`app/_layout.tsx`** — Wrapped the app in `PostHogProvider` with autocapture enabled (touch events), and added manual screen tracking using `usePathname` and `useGlobalSearchParams`.
- **`app/onboarding.tsx`** — Tracks `onboarding_get_started_tapped` when the user taps the Get Started button.
- **`components/auth-screen.tsx`** — Tracks `sign_up_submitted`, `sign_up_completed` (with `posthog.identify`), `sign_in_submitted`, `sign_in_completed` (with `posthog.identify`), `social_auth_started`, `social_auth_completed`, and `$exception` events for error tracking.
- **`app/LanguageSelection.tsx`** — Tracks `language_selected` when a user taps a language row, and `language_confirmed` when they confirm their choice.
- **`app/(tabs)/home.tsx`** — Tracks `continue_learning_tapped` with `language` and `unit` properties.

| Event | Description | File |
|---|---|---|
| `sign_up_submitted` | User submits the email/password sign-up form | `components/auth-screen.tsx` |
| `sign_up_completed` | User successfully completes sign-up and email verification | `components/auth-screen.tsx` |
| `sign_in_submitted` | User submits the email sign-in form | `components/auth-screen.tsx` |
| `sign_in_completed` | User successfully signs in via email code verification | `components/auth-screen.tsx` |
| `social_auth_started` | User taps a social provider button (Google, LINE, GitHub, Apple) | `components/auth-screen.tsx` |
| `social_auth_completed` | User successfully authenticates via a social provider | `components/auth-screen.tsx` |
| `onboarding_get_started_tapped` | User taps the Get Started button on the onboarding screen | `app/onboarding.tsx` |
| `language_selected` | User taps a language row in the language selection screen | `app/LanguageSelection.tsx` |
| `language_confirmed` | User confirms their language choice and proceeds | `app/LanguageSelection.tsx` |
| `continue_learning_tapped` | User taps Continue button on the home screen to resume their lesson | `app/(tabs)/home.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1601544)
- [Sign-up Funnel](/insights/x4do4BVS) — Conversion from Get Started → sign-up submitted → sign-up completed
- [Sign-in Funnel](/insights/q2Hw0vtF) — Conversion from sign-in submitted to sign-in completed
- [Language Selections Over Time](/insights/kMwR68iV) — Daily unique users confirming a language
- [Social Auth Conversion](/insights/2RebTAJI) — Social auth started vs completed (OAuth drop-off)
- [Continue Learning Engagement](/insights/pHLgBnMu) — Daily unique users tapping Continue on the home screen

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
