#!/bin/sh
# Solo Linux x86_64. Archivos oficiales fijados y verificados antes de ejecutar.
set -eu
if [ "$(uname -s)" != Linux ] || [ "$(uname -m)" != x86_64 ]; then
  echo 'Este instalador requiere Linux x86_64.' >&2; exit 2
fi
if [ "$#" -ne 1 ]; then echo 'Uso: install-tools.sh DIRECTORIO_DESTINO' >&2; exit 2; fi
destination=$1
umask 077
mkdir -p "$destination"
if [ -e "$destination/gitleaks" ] || [ -L "$destination/gitleaks" ] || [ -e "$destination/osv-scanner" ] || [ -L "$destination/osv-scanner" ]; then
  echo 'El destino ya contiene una herramienta; elige un directorio vacío.' >&2; exit 2
fi
tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT HUP INT TERM
curl -fsSL --retry 2 --max-time 120 -o "$tmpdir/gitleaks.tar.gz" 'https://github.com/gitleaks/gitleaks/releases/download/v8.24.2/gitleaks_8.24.2_linux_x64.tar.gz'
printf '%s  %s\n' 'fa0500f6b7e41d28791ebc680f5dd9899cd42b58629218a5f041efa899151a8e' "$tmpdir/gitleaks.tar.gz" | sha256sum -c -
tar -xzf "$tmpdir/gitleaks.tar.gz" -C "$tmpdir" gitleaks
curl -fsSL --retry 2 --max-time 120 -o "$tmpdir/osv-scanner" 'https://github.com/google/osv-scanner/releases/download/v2.1.0/osv-scanner_linux_amd64'
printf '%s  %s\n' '0d1123af0173ba42eef84b4d1c04750e417296a8cf25440c72ba39b4ef0859e4' "$tmpdir/osv-scanner" | sha256sum -c -
chmod 700 "$tmpdir/gitleaks" "$tmpdir/osv-scanner"
[ "$("$tmpdir/gitleaks" version)" = '8.24.2' ]
[ "$("$tmpdir/osv-scanner" --version | head -n 1)" = 'osv-scanner version: 2.1.0' ]
install -m 700 "$tmpdir/gitleaks" "$destination/gitleaks"
install -m 700 "$tmpdir/osv-scanner" "$destination/osv-scanner"
printf '%s\n' 'Herramientas verificadas instaladas.'
