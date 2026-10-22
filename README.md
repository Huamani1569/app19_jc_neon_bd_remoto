# App19 · CRUD de personas con Neon PostgreSQL + API REST + Retrofit

**Desarrollo de Aplicaciones Móviles · Semana 10 · Universidad Continental**  
Autor: Jean Piero Huamani Rodriguez

CRUD de personas (nombres, apellidos, fecha de nacimiento y DNI) guardado en una tabla **PostgreSQL de Neon** y consumido desde **Jetpack Compose** mediante una **API REST** propia (Node.js + Express + pg) con **Retrofit**.

La app nunca se conecta directo a la base: solo la API conoce la cadena de conexión (`.env`, que **no** se sube a GitHub).

## Estructura
```
app/                     ← Android (MVVM)
  model/      Persona, PersonaApiService (Retrofit), RetrofitClient, PersonaRepository (Result<T>)
  viewmodel/  PersonaUiState, PersonaViewModel (validación + CRUD)
  view/       PantallaPersona, FormularioPersona, PersonaItem, SelectorFecha, FormatoFecha
api-personas-neon/       ← API REST
  index.js    GET/POST/PUT/DELETE /api/personas (409 si el DNI se repite)
  db.js       Pool de conexiones a Neon
  schema.sql  Tabla personas (DNI CHAR(8) UNIQUE + CHECK)
```

## Ejecutar
```
cd api-personas-neon
copy .env.example .env      (pegar la DATABASE_URL de Neon)
npm install
npm run init-db             (crea la tabla y 3 personas de ejemplo)
npm start                   (http://localhost:3000/api/personas)
```
Luego en Android Studio: Run en el emulador (URL base `http://10.0.2.2:3000/`).
