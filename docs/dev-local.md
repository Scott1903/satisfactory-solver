# Local HTTPS Development for `satisfactory-solver`

This guide documents several ways to run the Django application over HTTPS on macOS, Linux, or Windows. It covers trusted certificates with `mkcert`, self-signed fallbacks, and ASGI alternatives, plus the supporting dependencies and configuration required.

## Environment Assumptions

- macOS with Homebrew installed (see [brew.sh](https://brew.sh)).
- Python virtual environment already created and activated (e.g. `.venv`).
- Project root: `satisfactory-solver` with Django settings module `satopt.settings`.
- Example HTTPS endpoint: <https://127.0.0.1:8100/>.
- Windows developers should have Chocolatey installed (see [chocolatey.org/install](https://chocolatey.org/install)).

## Python Dependencies

Create (if needed) and activate a local virtual environment before installing dependencies:

- **macOS / Linux**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```
- **Windows (PowerShell)**
  ```powershell
  py -3 -m venv .venv
  .\.venv\Scripts\Activate.ps1
  ```

With the virtualenv active, install the project requirements (they already include the HTTPS helpers):

```bash
pip install -r requirements.txt
```

Key packages involved:

- `django-extensions` – exposes `runserver_plus` for HTTPS-ready dev runs.
- `pyOpenSSL` and `Werkzeug` – TLS support for `runserver_plus`.
- `uvicorn` – optional ASGI server with `--ssl-*` flags.
- `django-sslserver` – legacy fallback that can auto-generate certs.

## Prepare the Database

Before launching any HTTPS-enabled dev server, make sure the Django database is ready:

```bash
python manage.py migrate
```

Optionally seed an admin account for UI access:

```bash
python manage.py createsuperuser
```

The same one-line commands work in PowerShell. Run them once per environment (or whenever migrations change) before starting the server.

## Option A – Trusted Certificates via `mkcert` (Recommended)

`mkcert` creates locally trusted certificates so browsers do not warn about HTTPS.

1. **Install and trust the local CA**
   - **macOS (Homebrew)** (see [brew.sh](https://brew.sh))
     ```bash
     brew install mkcert
     brew install nss        # optional: Firefox trust store
     ```
   - **Ubuntu / Debian**
     ```bash
     sudo apt update
     sudo apt install mkcert libnss3-tools
     ```
   - **Fedora / RHEL**
     ```bash
     sudo dnf install mkcert nss-tools
     ```
   - **Arch / Manjaro**
     ```bash
     sudo pacman -S mkcert nss
     ```
   - **Windows (Chocolatey)** (see [chocolatey.org/install](https://chocolatey.org/install))
     ```powershell
     choco install mkcert
     choco install nss -y   # optional for Firefox trust store
     ```

   After installing the binaries, run:
   ```bash
   mkcert -install    # adds the mkcert CA to the OS trust store (and Firefox if NSS is present)
   ```
   - View CA location: `mkcert -CAROOT`
   - Remove later: `mkcert -uninstall` (then delete the CA directory).

2. **Generate project certificates**
   - **macOS / Linux**
     ```bash
     mkdir -p certs
     mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem \
       localhost 127.0.0.1 ::1
     ```
   - **Windows (PowerShell)**
     ```powershell
     New-Item -ItemType Directory -Force -Path certs | Out-Null
     mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem `
       localhost 127.0.0.1 ::1
     ```
   Certificates live under `certs/` and are ignored by Git via `.gitignore`.

3. **Run the app over HTTPS**
   - **Django (WSGI) with `runserver_plus`**  
     Command is identical in Bash and PowerShell—run it on one line:
     ```bash
     python manage.py runserver_plus --cert-file certs/localhost.pem --key-file certs/localhost-key.pem 127.0.0.1:8100
     ```
   - **ASGI with `uvicorn`**
     - macOS / Linux
       ```bash
       DJANGO_ALLOW_ASYNC_UNSAFE=true \
       uvicorn satopt.asgi:application --host 127.0.0.1 --port 8100 \
         --ssl-certfile certs/localhost.pem \
         --ssl-keyfile  certs/localhost-key.pem
       ```
     - Windows (PowerShell)
       ```powershell
       $env:DJANGO_ALLOW_ASYNC_UNSAFE = "true"
       uvicorn satopt.asgi:application --host 127.0.0.1 --port 8100 `
         --ssl-certfile certs/localhost.pem `
         --ssl-keyfile  certs/localhost-key.pem
       ```
     > The environment variable suppresses startup `SynchronousOnlyOperation` errors that can arise from sync DB access in dev.

## Option B – Self-Signed Certificates with OpenSSL

Use this when `mkcert` is unavailable. Browsers will warn until you manually trust the cert.

1. **Generate SAN-aware self-signed certs**
   - **macOS / Linux**
     ```bash
     mkdir -p certs
     cat > certs/localhost-openssl.cnf <<'CNF'
     [req]
     default_bits = 2048
     prompt = no
     default_md = sha256
     x509_extensions = v3_req
     distinguished_name = dn

     [dn]
     CN = localhost

     [v3_req]
     subjectAltName = @alt_names

     [alt_names]
     DNS.1 = localhost
     IP.1 = 127.0.0.1
     IP.2 = ::1
     CNF

     openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
       -keyout certs/localhost-key.pem -out certs/localhost.pem \
       -config certs/localhost-openssl.cnf
     ```
   - **Windows (PowerShell)**
     ```powershell
     New-Item -ItemType Directory -Force -Path certs | Out-Null
     @'
     [req]
     default_bits = 2048
     prompt = no
     default_md = sha256
     x509_extensions = v3_req
     distinguished_name = dn

     [dn]
     CN = localhost

     [v3_req]
     subjectAltName = @alt_names

     [alt_names]
     DNS.1 = localhost
     IP.1 = 127.0.0.1
     IP.2 = ::1
     '@ | Set-Content -Path certs/localhost-openssl.cnf -Encoding ASCII

     openssl req -x509 -newkey rsa:2048 -nodes -days 825 `
       -keyout certs/localhost-key.pem -out certs/localhost.pem `
       -config certs/localhost-openssl.cnf
     ```
     > Install OpenSSL via Chocolatey (`choco install openssl`) if it is not already available.

2. **Run with the self-signed certs**
   - **`runserver_plus`** (same command in Bash and PowerShell)
     ```bash
     python manage.py runserver_plus --cert-file certs/localhost.pem --key-file certs/localhost-key.pem 127.0.0.1:8100
     ```
   - **`uvicorn`**
     - macOS / Linux
       ```bash
       DJANGO_ALLOW_ASYNC_UNSAFE=true \
       uvicorn satopt.asgi:application --host 127.0.0.1 --port 8100 \
         --ssl-certfile certs/localhost.pem \
         --ssl-keyfile  certs/localhost-key.pem
       ```
     - Windows (PowerShell)
       ```powershell
       $env:DJANGO_ALLOW_ASYNC_UNSAFE = "true"
       uvicorn satopt.asgi:application --host 127.0.0.1 --port 8100 `
         --ssl-certfile certs/localhost.pem `
         --ssl-keyfile  certs/localhost-key.pem
       ```

3. **(Optional) Trust the cert manually**
   - **Safari / Chrome**: import `certs/localhost.pem` into Keychain Access and set to *Always Trust*.
   - **Firefox**: Preferences → Privacy & Security → Certificates → View Certificates → *Authorities* → **Import**.

## Option C – `django-sslserver` Quickstart

`django-sslserver` can auto-generate certs and run without additional tools. Resulting certs are still untrusted unless you import them manually.

```bash
python manage.py runsslserver 127.0.0.1:8100
```
PowerShell uses the same syntax; run the command on a single line.

Add `--nothreading` if you hit threading-related reload issues:

```bash
python manage.py runsslserver 127.0.0.1:8100 --nothreading
```
Same command applies in PowerShell; run it on a single line as well.
Or reuse the certificates from Options A/B:

```bash
python manage.py runsslserver --certificate certs/localhost.pem --key certs/localhost-key.pem 127.0.0.1:8100
```
PowerShell users can run the same command without changes.

Optional:

```bash
python manage.py runsslserver --certificate certs/localhost.pem --key certs/localhost-key.pem 127.0.0.1:8100 --nothreading
```
Again, the PowerShell command is identical when entered on one line.

## Troubleshooting

- **“Bad request version” or TLS gibberish** – ensure you open `https://` on the HTTPS port; plain HTTP against the TLS socket triggers this error.
- **`SynchronousOnlyOperation` under ASGI** – set `DJANGO_ALLOW_ASYNC_UNSAFE=true` (dev only) or prefer `runserver_plus`.
- **Firefox distrusts cert** – install `nss`, re-run `mkcert -install`, or import the certificate manually as an authority.

## Summary Checklist

1. Install helper packages in the virtualenv (`django-extensions`, `pyOpenSSL`, `Werkzeug`, `uvicorn`, `django-sslserver`).
2. (Already configured) Ensure `'sslserver'` and `'django_extensions'` stay in `INSTALLED_APPS`.
3. Generate certificates via `mkcert` (trusted) or OpenSSL (self-signed).
4. Launch the server with `runserver_plus`, `uvicorn`, or `runsslserver` using the generated certs.
