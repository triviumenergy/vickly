# Vickly

Time tracking simple y 100% gratuito. Proyecto en desarrollo.

## Stack
- Next.js 14 + TypeScript
- Tailwind CSS (colores y tipografía centralizados en `app/globals.css`)
- Supabase (base de datos + autenticación)
- Vercel (hosting)

## Cómo arrancar en local
```bash
npm install
npm run dev
```

## Base de datos
El esquema inicial está en `supabase/schema.sql`. Se corre una sola vez
desde el SQL Editor de tu proyecto en Supabase (Dashboard → SQL Editor →
pegar el contenido del archivo → Run).

## Variables de entorno
Copiar `.env.example` como `.env.local` y completar con los datos de tu
proyecto en Supabase (Dashboard → Settings → API).
