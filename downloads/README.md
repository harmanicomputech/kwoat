# Upload packages

Ready-to-upload builds for cPanel / DirectAdmin. Download one, extract it, and upload the **contents** into
`public_html/` (make sure the hidden `.htaccess` file comes along).

| File | Design |
|---|---|
| `kwoat-v4-public_html.zip` | v4 "Prism" — light/dark, live product-window hero |
| `kwoat-v3-public_html.zip` | v3 "Convergence" — dark, light-ray hero |
| `kwoat-v2-public_html.zip` | v2 "Signal" — paper and ink, K-1 device |
| `kwoat-v1-public_html.zip` | v1 — dark violet, 3D orb |

## Previewing without a server

The zips are for a web host: their `index.html` shows a blank page if you double-click it on your computer, because
the site loads its code from `/assets/…` on the server.

To look at v4 on your own computer, download **`kwoat-v4-preview.html`** instead and double-click it. It is the
whole site in one file (code, fonts and images inlined) and works offline in any modern browser. Don't upload the
preview file to the host — use the zip for that.
