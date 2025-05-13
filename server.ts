// api/server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from 'hono/cors';
import pokemon from "./routes/pokemon";
import auth from "./routes/auth";
import amis from "./routes/amis";
import equipe from "./routes/equipe";

const app = new Hono();


app.use('/*', cors({
  origin: ['http://localhost:3001'], 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

app.route('/pokemons', pokemon);
app.route('/auth', auth);
app.route('/amis', amis)
app.route('/equipe', equipe)

app.get('/', (c) => c.text('Bienvenue sur DemonPoke API'));

const PORT = 3000;

console.log(`✅ Hono server running on http://localhost:${PORT}`);
serve({
  fetch: app.fetch,
  port: PORT
});
