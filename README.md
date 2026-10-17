# ShopFast: GitHub Actions class project

Build a delivery pipeline for a small Node.js shop service, progressing from basic CI to a scanned container release and an approved deployment. This is a two-week class project based on StacStart Module 08, with GitHub Actions as the chosen CI/CD tool.

The repository includes a working application and reference workflows. Students must complete the changes and failure drills below; running the supplied examples alone does not complete the assignment. No GitHub repository or cloud resources have been created for you.

## Learning path

| Level | Suggested time | Outcome | Marks |
| --- | --- | --- | --- |
| [Basic](class-tasks/01-basic.md) | Days 1-3, 2-3 hours | Push/PR checks and evidence of a test blocking a build | 25 |
| [Intermediate](class-tasks/02-intermediate.md) | Days 4-6, 3-4 hours | Matrix tests, cache, artifacts and merge protection | 30 |
| [Advanced](class-tasks/03-advanced.md) | Days 7-10, 5-7 hours | Scan, registry, approval, deployment and rollback | 45 |

CI builds and tests changes. Continuous delivery keeps a passing release ready for an approved deployment. Continuous deployment automatically deploys passing releases. Naming a GitHub environment `production` does **not** create an approval gate: configure required reviewers explicitly.

## Prerequisites

- A GitHub.com account, Git, and Node.js 22 or 24 with npm. Use Node 24 for the main class environment.
- An editor and basic JavaScript, Git, command-line and YAML knowledge.
- Basic/intermediate: no Docker, server, paid cloud account or custom secrets required.
- Advanced: Docker with Linux containers, a dedicated Linux x86-64 host with Docker, Bash and `flock`, and SSH access. An instructor can provide this host. Hosting and private-repository Actions usage may incur costs.

## Start locally

Run these commands from this folder in PowerShell, Bash or another terminal:

```sh
npm ci
npm run check
npm test
npm run build
npm start
```

Open **http://localhost:3000/** to see the ShopFast website. Students can browse three products, add/remove items in a demo basket, and check the running application's health. The basket stays in browser memory and resets on refresh; there are no payments or real orders.

The JSON endpoints are `http://localhost:3000/health` (health status) and `http://localhost:3000/api` (application information). Stop with Ctrl+C. The build copies the service and website assets into `dist/`; this JavaScript app needs no compiler or external npm dependencies. The lockfile is committed for repeatable `npm ci`. Dependency auditing and caching are included to teach the workflow, but their benefit is limited until dependencies are added.

To practice a visible deployment change, edit the heading in `src/public/index.html` or the colours in `src/public/styles.css`, rebuild, restart the server and refresh your browser. Commit and push the same change to observe it through CI/CD. The browser interactions live in `src/public/shop.js`.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd` in place of `npm` (for example, `npm.cmd test`). No execution-policy change is needed.

Optional local container practice, after building:

```sh
docker build -t shopfast:local .
docker run --rm --name shopfast-local -p 8080:3000 shopfast:local
```

Open `http://localhost:8080/` for the website and `http://localhost:8080/health` for the health endpoint. The image includes the website assets and runs as the `node` user.

## Put the project on GitHub

1. Create an empty GitHub repository, preferably public for classroom collaboration. Do not initialize it with another README.
2. Replace `YOUR-USERNAME` in the URL below. These commands assume this folder is not already a Git repository:

   ```sh
   git init -b main
   git add .
   git commit -m "Add ShopFast CI/CD class project"
   git remote add origin https://github.com/YOUR-USERNAME/shopfast-cicd-class.git
   git push -u origin main
   ```

3. Open **Actions**, enable workflows if prompted, and inspect **Basic CI**.
4. Create a branch for each assignment, push it, and open a pull request targeting `main`. Record run links in [your submission](submission/README.md).

The advanced jobs are skipped until repository variables enable them. Manual workflows become available after their files are on the default branch. All examples assume your default branch is `main`.

## Repository map

```text
.github/workflows/01-basic.yml          Push/PR build and test
.github/workflows/02-intermediate.yml   Matrix tests and build artifact
.github/workflows/03-advanced.yml       Build, test, scan, publish, deploy
.github/workflows/04-rollback.yml       Restore a previous image digest
src/                                   Application source
test/                                  Unit and HTTP integration tests
scripts/build.js                       Build the application
scripts/ssh-deploy.sh                   Verified SSH connection
scripts/deploy.sh                       Deploy and health-check on Linux
class-tasks/                           Assignments and assessment criteria
submission/README.md                   Student evidence template
Dockerfile                             Container using the built dist/ files
```

## Workflow behavior

| Workflow | Trigger | Gate or output |
| --- | --- | --- |
| Basic CI | Push to main, PR to main, manual | Syntax checks, tests, build |
| Intermediate CI | PR to main, manual | Four OS/Node combinations, then audit/build/artifact |
| Advanced delivery | Push to main, manual on main | Enabled by `ENABLE_ADVANCED=true`; scan must pass before push |
| Rollback production | Manual on main | `ENABLE_DEPLOY=true`; production environment rules |

Basic and intermediate can both run for a PR; this is intentional for comparing the levels. Jobs normally run independently. `needs: test` delays packaging until **all** matrix jobs pass. A failing step stops later steps by default. An artifact transfers build output; a cache accelerates repeat dependency downloads.

## Configure advanced delivery

Complete [the advanced assignment](class-tasks/03-advanced.md) alongside these steps.

1. In **Settings > Secrets and variables > Actions > Variables**, set repository variable `ENABLE_ADVANCED` to `true`. Leave `ENABLE_DEPLOY` unset initially.
2. Run **Advanced delivery** on `main`. It tests and builds, runs `npm audit`, builds an image, scans HIGH/CRITICAL vulnerabilities with Trivy, then publishes to `ghcr.io/<lowercase-owner>/<lowercase-repository>`. The provided `GITHUB_TOKEN` authenticates publishing; do not create a PAT for this workflow.
3. Find the image under the repository owner's **Packages**. Set the classroom package visibility to **Public** so the server can pull it without registry credentials. Public repository visibility alone does not make its container package public. Only publish classroom code intended to be public. For a private package, the instructor must separately configure read-only registry authentication on the host.
4. Prepare a dedicated Linux x86-64 server. Install Docker Engine, ensure the deployment user can run `docker ps` without sudo, and install Bash and `flock` (usually from `util-linux`). Docker access is privileged; use a class host. Keep port 8080 free. Permit SSH on port 22 from the runner and HTTP port 8080 from your test client using the host's firewall/security group. Verify public reachability; hosted runners cannot directly reach a private-only server.
5. Create a dedicated SSH key pair on your machine with `ssh-keygen -t ed25519 -f shopfast-deploy` **outside this repository**. Install its public key in the deployment user's `~/.ssh/authorized_keys`. The automated example requires a key without an interactive passphrase. Store its private key only in the secret below.
6. Obtain the host's SSH public key/fingerprint using the server console or your instructor. Build a verified `known_hosts` entry for the exact hostname/IP you will use. If using `ssh-keyscan HOST`, compare its fingerprint with the trusted console value before saving it; an unverified scan alone does not establish trust.
7. Create **Settings > Environments > production**. Add a required reviewer, enable prevention of self-review where available, and restrict deployment branches to `main`. Environment protection availability depends on your repository and GitHub plan. If required reviewers are unavailable, have the instructor provide a suitable repository; do not claim the deployment was approval-gated.
8. Add these **environment secrets**, not repository files:

   | Secret | Value |
   | --- | --- |
   | `DEPLOY_HOST` | Server DNS name or IPv4 address, without protocol or port |
   | `DEPLOY_USER` | Linux account with Docker access |
   | `DEPLOY_SSH_KEY` | Complete private key, including header/footer and newlines |
   | `DEPLOY_KNOWN_HOSTS` | Verified OpenSSH known_hosts entry for that host |

9. Set repository variable `ENABLE_DEPLOY=true`. Run **Advanced delivery** on `main`, review the image digest in the release job summary, and have the reviewer approve the deployment.
10. Verify `http://HOST:8080/` and `/health` from your browser. Record the URL, commit, image digest and run link. This is a classroom HTTP service; HTTPS/domain setup is an optional extension.

The exact scanned image is pushed with a commit tag and a `version-commit` tag, then deployed by immutable digest. Version comes from `package.json`. Tags are convenient labels and can be overwritten; the digest identifies the artifact. The server pulls before stopping its current container. Container replacement introduces brief downtime; this is not a blue/green deployment.

Production deployments and rollbacks share a concurrency group. Failed startup/health checks trigger automatic restoration of the previous container when one exists, and the job still fails so the incident is visible. First deployment has no previous release. A host-level lock prevents simultaneous script executions.

For a manual rollback, select **Rollback production > Run workflow**, choose `main`, and supply the `sha256:...` portion of a previous approved digest from a release summary. Approval rules still apply. The workflow restricts images to this repository's GHCR package. It does not rescan an old image; the reviewer must confirm the digest is an acceptable recovery target.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Advanced job skipped | Exact variable value `true`, selected branch `main`, and repository-level variables |
| Build cannot copy `dist/` into Docker | Run `npm run build` before `docker build` |
| `npm ci` fails | Commit a lockfile consistent with `package.json`; regenerate with `npm install --package-lock-only` |
| Package push denied | Repository policy must allow the job's `packages: write`; existing package must grant this repository access |
| Server pull denied | GHCR package visibility or preconfigured private registry access |
| SSH host key verification fails | Match the verified known_hosts entry to `DEPLOY_HOST`; verify changes with the host administrator |
| SSH timeout / permission denied | Firewall, public host reachability, username, authorized_keys and full private key |
| Trivy blocks the release | Read findings, update the base image/dependencies, rebuild and rescan; do not disable the gate |
| No approval prompt | Required reviewers were not configured or are unavailable on this plan |
| Deploy fails | Inspect host `docker ps -a`, Docker health status and `docker logs shopfast`; verify port 8080 is free |
| App works locally but not remotely | Check host firewall, security group and externally reachable address |

## Instructor guidance and references

Use pairs for review and approval. Assess the evidence and the student's explanation, not only a green badge. See each task's rubric and the submission template. The source module's practical criteria (pages 32-34) map to advanced build/test/image/scan/push/deploy; basic and intermediate introduce those concepts progressively. Its OIDC/cloud deployment material is covered by an advanced extension; the core lab uses SSH to avoid assuming an AWS/Azure account.

Official references used for the examples:

- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
- [Checkout action](https://github.com/actions/checkout) and [Node setup](https://github.com/actions/setup-node)
- [Build artifacts](https://github.com/actions/upload-artifact)
- [Trivy action and scan gates](https://github.com/aquasecurity/trivy-action)
- [GitHub deployment environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-environments-for-deployment)
- [GHCR authentication and visibility](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

Actions use explicit release versions for readability. As an advanced hardening exercise, resolve them to reviewed full commit SHAs and automate updates. Runtime base images also need regular reviewed updates.
