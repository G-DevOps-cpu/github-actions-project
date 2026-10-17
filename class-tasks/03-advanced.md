# Advanced: ship a scanned image and recover safely

**Goal:** implement the complete Module 08 pipeline and prove its gates. Allow 5-7 hours plus host setup. Complete intermediate first. Follow the README advanced configuration in order.

## Tasks

1. Draw the actual path: push -> install/check/test/audit/build -> Docker build -> Trivy -> registry -> production approval -> deploy -> health check. Mark which steps require secrets or write permissions.
2. Enable publishing first. Produce a scanned release and record both image tags and its digest. Explain how `needs: release` and default step failure behavior block deployment after a failed scan/test.
3. Configure the dedicated Linux host, public classroom package, environment secrets, required reviewer and main-only deployment restriction. Enable deployment. Record the waiting-for-approval state and subsequent successful run.
4. Demonstrate the running app from outside the host. Match its deployment digest to the published release summary and commit.
5. Add a Trivy filesystem secret scan before Docker build (`scan-type: fs`, `scanners: secret`, `exit-code: '1'`). Consult the linked Trivy documentation. Never insert a real credential to test the scanner. Document that this detects supported secret patterns, not all possible leaked information.
6. Use your Basic/Intermediate failing-test evidence and identify the corresponding test gate in the advanced workflow. Explain why publishing cannot execute after that step fails and why `deploy` cannot execute after `release` fails. For a live advanced failure demonstration, ask the instructor to run a deliberately failing assertion in a disposable copy of this repository with deployment disabled. Keep deliberately broken code out of your normal main branch.
7. Demonstrate a blocked image scan in a separate, manual, read-only workflow using an instructor-approved vulnerable training image. Include only scanning steps, with HIGH/CRITICAL and exit code 1; never push/deploy this image. Capture the failure and explain the remediation for a real application. Do not weaken the main gate to obtain a green run.
8. Deploy release A; save its digest. Change the website heading in `src/public/index.html`, bump `package.json` and regenerate the lockfile, then deploy release B through a PR. Use **Rollback production** with A's digest. Refresh the website, verify the old heading and record elapsed recovery time.
9. In a disposable class environment, test automatic recovery by deploying an instructor-approved image whose health check fails. Run the host deployment script against its digest, and show that the previous healthy container is restored while the script exits nonzero. Keep this fault drill out of the normal main release workflow.
10. Submit a short incident note: symptom, failing gate, fix, commit/run/image linkage and recovery time. Explain which DORA metric the recovery drill approximates and why two releases are insufficient for a meaningful long-term metric.

## Acceptance and marking: 45 points

| Evidence | Points |
| --- | --- |
| Build/test/audit/image/scan gates and secret scan addition | 10 |
| Published version+commit tags and digest traceability | 7 |
| Protected environment, scoped permissions and safe secret handling | 8 |
| Approved deployment reachable from outside the server | 8 |
| Manual rollback and automatic recovery evidence | 8 |
| Incident note and CI/delivery/deployment explanation | 4 |

## Extensions (ungraded)

- Replace SSH with AWS/Azure OIDC: restrict trust to this repository and production environment, grant only required deployment permissions, and promote the same digest. Document how short-lived credentials differ from SSH keys. Provisioning costs and cloud permissions are separate from this lab.
- Replace brief container downtime with blue/green routing and a smoke-test gate before switching traffic.
- Pin all actions and the base image to reviewed immutable digests/SHAs, and propose an update policy.
- Add an external HTTP smoke test and discuss why container health alone does not prove firewall/DNS availability.

Do not report a deployment or approval as completed if you only reviewed the YAML. Clearly identify any instructor-dependent setup still outstanding.
