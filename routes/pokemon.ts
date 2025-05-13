import { Hono } from "hono";

const pokemon = new Hono();

pokemon.get("/", (c) => c.text("API Hono is running"));

pokemon.get("/pokemons", async (c) => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
  const data = await res.json();
  console.log(data.results.length);
  return c.json(data.results);
});

pokemon.get("/pokemon/:name", async (c) => {
  const { name } = c.req.param();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  if (!res.ok) {
    return c.json({ error: "Not found" }, 404);
  }
  const data = await res.json();
  return c.json(data);
});

pokemon.get("/pokemon/:id", async (c) => {
  const { id } = c.req.param();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) {
    return c.json({ error: "Not found" }, 404);
  }
  const data = await res.json();
  return c.json(data);
});

pokemon.get("/randomPokemon", async (c) => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
  const data = await res.json();
  const randomIndex = Math.floor(Math.random() * data.results.length);
  const randomPokemon = data.results[randomIndex];
  const pokemonRes = await fetch(randomPokemon.url);
  const pokemonData = await pokemonRes.json();
  return c.json(pokemonData);
});

export default pokemon;