# Immagine base: Node 24 
FROM node:24-alpine

# Tool di sistema richiesti dall'entrypoint:
# - bash            -> esegue entrypoint.sh
# - openssl         -> genera la coppia di chiavi RSA per JWT RS256
# - postgresql-client -> fornisce pg_isready per attendere che il DB sia pronto
RUN apk add --no-cache bash openssl postgresql-client

# Cartella di lavoro dentro il container
WORKDIR /usr/src/app

# Copiamo prima SOLO i manifest: se non cambiano, Docker riusa il layer di npm ci (build piu' veloci)
COPY package.json package-lock.json ./

# Installazione riproducibile dal lockfile (piu' affidabile di "npm install" in Docker).
# Manteniamo anche le devDependencies: servono tsx e sequelize-cli a runtime in sviluppo.
RUN npm ci

# Copiamo il resto del codice (il .dockerignore filtra cio' che non deve entrare)
COPY . .

# entrypoint.sh creo dopo: qui garantiamo fine-riga LF e lo rendiamo eseguibile
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# Porta dell'app Express
EXPOSE 3000

# L'entrypoint prepara l'ambiente (chiavi, attesa DB, migrate, seed)
ENTRYPOINT ["bash", "entrypoint.sh"]

# Comando di default: sviluppo con tsx (hot-reload).
# Il build di produzione resta disponibile con "npm run build" + "npm start".
CMD ["npm", "run", "dev"]