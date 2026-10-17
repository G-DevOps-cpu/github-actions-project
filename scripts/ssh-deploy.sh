#!/usr/bin/env bash
set -euo pipefail
: "${IMAGE:?}" "${DEPLOY_HOST:?}" "${DEPLOY_USER:?}" "${DEPLOY_SSH_KEY:?}" "${DEPLOY_KNOWN_HOSTS:?}"
[[ "$IMAGE" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]] || exit 1
[[ "$DEPLOY_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || exit 1
[[ "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || exit 1
keydir=$(mktemp -d)
trap 'rm -rf "$keydir"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$keydir/key"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$keydir/known_hosts"
chmod 600 "$keydir/key" "$keydir/known_hosts"
ssh -i "$keydir/key" -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$keydir/known_hosts" \
  "$DEPLOY_USER@$DEPLOY_HOST" "bash -s -- '$IMAGE'" < scripts/deploy.sh
