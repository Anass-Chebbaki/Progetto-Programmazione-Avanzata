#!/usr/bin/env bash
# entrypoint.sh — preparazione dell'ambiente all'avvio del container "app".
# Ordine: (1) chiavi RS256, (2) attesa Postgres, (3) migrazioni, (4) seed, (5) avvio app.
# set -e: interrompe l'avvio al primo errore reale; i cicli di attesa sono esenti.
set -eo pipefail

# --- Default sicuri, sovrascritti dalle variabili iniettate dal .env se presenti ---
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-postgres}"
PRIVATE_KEY_PATH="${PRIVATE_KEY_PATH:-./src/secrets/jwtRS256.key}"
PUBLIC_KEY_PATH="${PUBLIC_KEY_PATH:-./src/secrets/jwtRS256.key.pub}"

echo "==> [entrypoint] Avvio preparazione ambiente"

# -----------------------------------------------------------------------------
# 1) Chiavi RS256: la PRIVATA firma i JWT, la PUBBLICA li verifica.
#    Generiamo la coppia SOLO se non esiste gia' (idempotente): i token restano
#    validi tra un riavvio e l'altro.
# -----------------------------------------------------------------------------
mkdir -p "$(dirname "$PRIVATE_KEY_PATH")"
if [ ! -f "$PRIVATE_KEY_PATH" ]; then
  echo "==> [entrypoint] Genero la coppia di chiavi RSA (RS256)..."
  # Chiave privata RSA 2048 bit in PEM (PKCS#8)
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$PRIVATE_KEY_PATH"
  # Chiave pubblica derivata dalla privata
  openssl rsa -in "$PRIVATE_KEY_PATH" -pubout -out "$PUBLIC_KEY_PATH"
  # Permessi: privata leggibile solo dal proprietario
  chmod 600 "$PRIVATE_KEY_PATH"
  chmod 644 "$PUBLIC_KEY_PATH"
  echo "==> [entrypoint] Chiavi create in $(dirname "$PRIVATE_KEY_PATH")"
else
  echo "==> [entrypoint] Chiavi gia' presenti: riuso quelle esistenti"
fi

# -----------------------------------------------------------------------------
# 2) Attesa di Postgres: l'app parte solo quando il DB accetta connessioni.
# -----------------------------------------------------------------------------
echo "==> [entrypoint] Attendo Postgres su ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" >/dev/null 2>&1; do
  echo "    ...Postgres non ancora pronto, ritento tra 2s"
  sleep 2
done
echo "==> [entrypoint] Postgres pronto"

# -----------------------------------------------------------------------------
# 3) Migrazioni: portano lo schema all'ultima versione.
#    oNOTA: nessuna migrazione ancora presente -> no-op senza errori.
# -----------------------------------------------------------------------------
echo "==> [entrypoint] Eseguo le migrazioni..."
npm run migrate

# -----------------------------------------------------------------------------
# 4) Seed: popola i dati iniziali (es. utenti con credito token).
#    NOTA: nessun seeder ancora presente -> no-op senza errori.
# -----------------------------------------------------------------------------
echo "==> [entrypoint] Eseguo i seed..."
npm run seed

# -----------------------------------------------------------------------------
# 5) Avvio dell'app: exec sostituisce la shell col processo Node,
#    cosi' i segnali arrivano direttamente all'applicazione.
# -----------------------------------------------------------------------------
echo "==> [entrypoint] Preparazione completata, avvio applicazione"
exec "$@"