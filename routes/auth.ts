import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { createSession } from "../session";
import * as bcrypt from 'bcrypt';



const auth = new Hono();
const prisma = new PrismaClient();


auth.post("/connexion", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return c.json({ message: "Utilisateur non trouvé" }, 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({ message: "Mot de passe incorrect" }, 401);
    }

    await createSession(c, user.id);

    return c.json({
      success: true,
      message: "Connexion réussie",
      user: { id: user.id, username: user.username, email: user.email }
    }, 200);
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return c.json({
      success: false,
      message: "Erreur lors de la connexion",
      error: error.message
    }, 400);
  }
});

auth.post("/inscription", async (c) => {
  try {
    const { email, password, username } = await c.req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    await createSession(c, user.id);

    return c.json({
      success: true,
      message: "Inscription réussie",
      user: { id: user.id, email: user.email }
    }, 201);
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return c.json({
      success: false,
      message: "Erreur lors de l'inscription",
      error: error.message
    }, 400);
  }
});

export default auth;
