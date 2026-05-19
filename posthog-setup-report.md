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

## Environment variables

Set these values from your PostHog project settings before running the app. In PostHog, open your project dashboard and go to Project > Setup to find the API key/project token and host.

```bash
POSTHOG_API_KEY=phc_your_project_token_here
POSTHOG_HOST=https://us.i.posthog.com
```

You can export them in your shell, place them in `.env`, or store them as CI secrets. `app.config.js` reads `process.env.POSTHOG_API_KEY` into `extra.posthogProjectToken` and `process.env.POSTHOG_HOST` into `extra.posthogHost`, and `lib/posthog.ts` reads those values with `Constants.expoConfig?.extra`. Restart the Expo dev server after changing environment variables.

| Event | Description | File |
|---|---|---|
| `app_opened` | App finishes loading and the root layout captures an app-open lifecycle event | `app/_layout.tsx` |
| `$screen` | Manual screen tracking emits when the Expo Router pathname changes via `usePathname` | `app/_layout.tsx` |
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

- [Analytics basics dashboard](https://app.posthog.com/project/YOUR_PROJECT_ID/dashboard/1601544)
- [Sign-up Funnel](https://app.posthog.com/project/YOUR_PROJECT_ID/insights/x4do4BVS) — Conversion from Get Started → sign-up submitted → sign-up completed
- [Sign-in Funnel](https://app.posthog.com/project/YOUR_PROJECT_ID/insights/q2Hw0vtF) — Conversion from sign-in submitted to sign-in completed
- [Language Selections Over Time](https://app.posthog.com/project/YOUR_PROJECT_ID/insights/kMwR68iV) — Daily unique users confirming a language
- [Social Auth Conversion](https://app.posthog.com/project/YOUR_PROJECT_ID/insights/2RebTAJI) — Social auth started vs completed (OAuth drop-off)
- [Continue Learning Engagement](https://app.posthog.com/project/YOUR_PROJECT_ID/insights/pHLgBnMu) — Daily unique users tapping Continue on the home screen

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
