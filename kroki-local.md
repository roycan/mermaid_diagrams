# Run Kroki locally with Podman

This guide shows how to run a local Kroki server with Podman and integrate it with this app.

## Quick start (most used)

Run Kroki in the background on localhost:8000. It will only be reachable from your machine.

```bash
# Pull and start (detached)
podman run -d \
  --name kroki \
  -p 127.0.0.1:8000:8000 \
  docker.io/yuzutech/kroki

# Verify it started
podman ps --filter name=kroki
```

- Base URL to use in the app: `http://localhost:8000`
- To stop later: `podman stop kroki`
- To start again: `podman start kroki`
- To see logs: `podman logs -f kroki`

If port 8000 is taken, replace `8000:8000` with another host port, e.g. `127.0.0.1:9000:8000`, and use `http://localhost:9000` as the base URL in the app.

---

## Prerequisites
- Podman installed (rootless recommended). See: https://podman.io/docs/installation
- A free local port (default 8000)
- Optional but recommended: a firewall that blocks external access; we bind to 127.0.0.1 for local-only access.

## Start, stop, restart
```bash
# Start (first time) - see quick start above
podman run -d --name kroki -p 127.0.0.1:8000:8000 docker.io/yuzutech/kroki

# Stop
podman stop kroki

# Restart (after stop or reboot if container exists)
podman start kroki

# Remove container (to recreate fresh)
podman rm -f kroki
```

## Auto-start on boot (optional)
Podman doesn’t auto-start containers on reboot by default. Use systemd user services to start Kroki at login or boot.

```bash
# 1) Create the container (if you haven’t already)
podman run -d --name kroki -p 127.0.0.1:8000:8000 docker.io/yuzutech/kroki

# 2) Generate a systemd unit for this container
podman generate systemd --new --files --name kroki

# This creates ./container-kroki.service in the current directory
# 3) Install it to your user systemd dir
mkdir -p ~/.config/systemd/user
mv container-kroki.service ~/.config/systemd/user/

# 4) Reload and enable the service for your user
systemctl --user daemon-reload
systemctl --user enable --now container-kroki.service

# [Optional] Allow services to run even without an active GUI session
loginctl enable-linger "$USER"
```

Notes:
- With the service enabled, Kroki will start automatically on login. With linger enabled, it can start at boot without a user session.
- To stop and disable: `systemctl --user disable --now container-kroki.service`
- Logs via: `journalctl --user -u container-kroki.service -f`

## Verify Kroki is running
Use a simple PlantUML test via HTTP POST to render an SVG locally:

```bash
cat > /tmp/kroki-test.puml <<'PUML'
@startuml
Alice -> Bob: Hi
@enduml
PUML

curl -s -X POST \
  -H 'Content-Type: text/plain' \
  --data-binary @/tmp/kroki-test.puml \
  http://localhost:8000/plantuml/svg \
  > /tmp/kroki-test.svg

# Open /tmp/kroki-test.svg in your browser/viewer
```

You should get a valid SVG file. If you mapped a different host port, replace `8000` with your chosen port.

## Integrate with this app
- In the UI, set “Kroki base URL” to your local instance, e.g. `http://localhost:8000`.
- The app will clear its cache when you change this value so previews refresh immediately.
- Both preview and PNG download will use your local Kroki once set.

## Update Kroki to a newer version
```bash
# Pull the latest image
podman pull docker.io/yuzutech/kroki

# If using a simple container
podman stop kroki && podman rm kroki
podman run -d --name kroki -p 127.0.0.1:8000:8000 docker.io/yuzutech/kroki

# If using the systemd service
systemctl --user stop container-kroki.service
podman rm kroki
podman pull docker.io/yuzutech/kroki
systemctl --user start container-kroki.service
```

## Troubleshooting
- Port already in use:
  - Pick a different host port: `-p 127.0.0.1:9000:8000` and use `http://localhost:9000` in the app.
- Can’t connect from the app:
  - Verify container is running: `podman ps --filter name=kroki`
  - Test rendering with curl (see Verify section)
  - Check logs: `podman logs kroki` or `journalctl --user -u container-kroki.service -f`
  - Firewall may block localhost; confirm that `localhost:PORT` is reachable.
- CORS issues:
  - Kroki typically returns permissive CORS headers. If your browser reports CORS errors, confirm you’re using `http://localhost:PORT` and not an IP or different origin policy. As a workaround, you can wrap Kroki behind a local reverse proxy that adds `Access-Control-Allow-Origin: *`.
- After changing the base URL in the app the preview still shows old errors:
  - The app now clears its internal availability cache when the base changes. Refresh the page once if needed.

## Security considerations
- Binding to `127.0.0.1` keeps Kroki local-only; avoid `-p 8000:8000` without the 127.0.0.1 prefix if you don’t want LAN access.
- Update the image periodically for security fixes.
- Stop the container when not in use if you prefer a smaller attack surface.

## Uninstall / cleanup
```bash
# If you used the systemd service
systemctl --user disable --now container-kroki.service
rm -f ~/.config/systemd/user/container-kroki.service
systemctl --user daemon-reload

# Remove the container and image
podman rm -f kroki || true
podman rmi docker.io/yuzutech/kroki || true
```

## References
- Kroki: https://kroki.io
- Podman docs: https://docs.podman.io/
