#!/usr/bin/env bash
# Runs on a dedicated Linux classroom host. Uses only the shopfast container.
set -euo pipefail
image=${1:?Supply a GHCR image digest}
[[ "$image" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]] || exit 1
exec 9>"$HOME/.shopfast-deploy.lock"
flock -n 9 || { echo 'Another deployment is running'; exit 1; }
docker pull "$image"
previous=$(docker inspect --format '{{.Config.Image}}' shopfast 2>/dev/null || true)
docker rm -f shopfast 2>/dev/null || true
healthy() {
  for attempt in {1..18}; do
    if [[ "$(docker inspect --format '{{.State.Health.Status}}' shopfast 2>/dev/null || true)" == healthy ]]; then
      return 0
    fi
    sleep 5
  done
  return 1
}
if docker run -d --name shopfast --restart unless-stopped -p 8080:3000 "$image" && healthy; then
  printf 'Deployed %s\nPrevious %s\n' "$image" "$previous"
else
  echo 'New release failed health checks; restoring previous container'
  docker rm -f shopfast 2>/dev/null || true
  if [[ -n "$previous" ]]; then
    docker run -d --name shopfast --restart unless-stopped -p 8080:3000 "$previous"
    healthy || { echo 'Rollback also failed health checks'; exit 1; }
  fi
  exit 1
fi
