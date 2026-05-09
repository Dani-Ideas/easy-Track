FROM node:20-alpine
WORKDIR /app

# Dependencias del sistema que necesita Prisma y netcat para el wait
RUN apk add --no-cache openssl netcat-openbsd

# Instalar dependencias primero (capa cacheada)
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Generar cliente Prisma y compilar Next.js
RUN npx prisma generate
RUN npm run build

RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
