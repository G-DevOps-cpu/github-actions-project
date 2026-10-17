# Basic: make every change prove it works

**Goal:** understand event -> workflow -> job -> step -> runner. Allow 2-3 hours. Start with the README local setup and a green Basic CI run.

## Tasks

1. Create `task/basic` from `main`. Read `.github/workflows/01-basic.yml` and annotate in your submission what `on`, `jobs`, `runs-on`, `uses` and `run` mean.
2. Add a `GET /version` route returning JSON `{ "version": "1.0.0" }`. Add an HTTP test for its status and body. Keep `/health` working.
3. Add a named workflow step that prints a non-secret class/team label using a workflow-level environment variable. Do not print all environment variables.
4. Run syntax checks, tests and build locally. Commit and push your branch, then open a PR to `main`. Locate the trigger, runner and individual step logs.
5. On this branch, intentionally change one expected total from `30` to `31`. Push it, record the red run URL, and verify the build step is skipped after the test failure.
6. Restore the correct expectation, push again, obtain a green run, and request a peer review before merging.

## Acceptance and marking: 25 points

| Evidence | Points |
| --- | --- |
| Working version endpoint with meaningful automated test | 8 |
| Correct workflow variable and named step | 5 |
| Failed run, skipped build and fixed green run links | 8 |
| Explanation of workflow anatomy and CI vs delivery | 4 |

Submit the PR and run links, a short explanation of the intentional failure, and local test results. Do not leave deliberately broken code on main.

**Discuss:** Why does checkout precede tests? What is the difference between a runner and an action? Why does a passing local test not replace CI?
