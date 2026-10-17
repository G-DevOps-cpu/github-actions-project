# Intermediate: quality gates and reusable build output

**Goal:** test across environments and produce an artifact only after all tests pass. Allow 3-4 hours. Complete basic first.

## Tasks

1. Create `task/intermediate`. Inspect the supplied matrix: two Node versions across Linux and Windows produce four jobs. Explain `fail-fast: false` and why each job needs checkout/setup/install.
2. Add tests rejecting a fractional quantity and an infinite price. Add a test for a POST to `/health` returning 404, matching the current read-only API.
3. Extend the intermediate trigger to include pushes to `main`. Preserve its PR and manual triggers.
4. Add a package-job summary using `$GITHUB_STEP_SUMMARY` with the commit and artifact name. Use environment variables for values passed to shell commands.
5. Open a PR. Inspect cache logs across repeated runs. Explain why caching npm's download cache does not replace `npm ci`, and why this dependency-free app shows little speed improvement.
6. Download `shopfast-<commit>` from a successful run. Extract it into a separate folder and run `node dist/server.js` there. Verify `/health` and `/version`.
7. Introduce and then repair a failing assertion on your branch. Demonstrate that matrix failure skips `package` and produces no new artifact for that failed run.
8. After checks have appeared at least once, configure a branch ruleset/protection for `main`: require a PR, one review and all four Intermediate test checks. Select their exact displayed names in GitHub; do not guess them. Have a peer attempt to merge a failing PR and record the block. If account permissions prevent configuration, ask the instructor to configure it.

## Acceptance and marking: 30 points

| Evidence | Points |
| --- | --- |
| Additional meaningful tests and four passing matrix jobs | 8 |
| Trigger change, package dependency and summary | 6 |
| Downloaded artifact runs independently | 6 |
| Failure gate and configured merge protection evidence | 7 |
| Clear explanation of cache vs artifact | 3 |

**Stretch:** add a scheduled dependency audit using UTC cron and explain why schedules normally use the default branch. Keep this optional scan separate from production deployment.
