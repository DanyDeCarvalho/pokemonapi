import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { verifySession } from "../session";

const equipe = new Hono();
const prisma = new PrismaClient();


equipe.get('/equipes', async (c) => {
    const session = await verifySession(c);
    console.log(session)

    const equipes = await prisma.equipe.findMany({
        where: {
            userId: session?.userId
        },
        include: {
            equipePokemon: {
                select: {
                    id: true,
                    pokemon: true
                }
            }
        }
    });

    return c.json(equipes);
});


equipe.delete('/equipe/:id', async (c) => {
    try {
        const session = await verifySession(c);
        if (!session) {
            return c.json({ message: "Non connecté" }, 401);
        }

        const equipeId = c.req.param('id');

        const equipe = await prisma.equipe.findUnique({
            where: {
                id: equipeId,
                userId: session.userId
            }
        });

        if (!equipe) {
            return c.json({ message: "Équipe non trouvée ou non autorisée" }, 404);
        }

        await prisma.equipe.delete({
            where: {
                id: equipeId
            }
        });

        return c.json({
            success: true,
            message: "Équipe supprimée avec succès"
        }, 200);

    } catch (error) {
        return c.json({
            success: false,
            message: "Erreur lors de la suppression de l'équipe",
            error: error.message
        }, 400);
    }
});


equipe.post('equipe', async (c) => {
    try {
        const session = await verifySession(c);
        const { nom, description } = await c.req.json();

        // if (!session) {
        //     return c.json({ message: "Non connecté" }, 401);
        // }

        const equipe = await prisma.equipe.create({
            data: {
                nom,
                userId: session.userId
            }
        });

        return c.json({
            success: true,
            message: "Équipe cree avec succès"
        }, 200);

    } catch (error) {
        return c.json({
            success: false,
            message: "Erreur lors de la creation de l'équipe",
            error: error.message
        }, 400);
    }
})


equipe.post('/equipe/:id/pokemon', async (c) => {
    try {
        const session = await verifySession(c);
        // if (!session) {
        //     return c.json({ message: "Non connecté" }, 401);
        // }

        const equipeId = c.req.param('id');
        const { pokemon } = await c.req.json();

        console.log('pokemon reçu :', pokemon);

        const equipe = await prisma.equipe.findUnique({
            where: {
                id: equipeId,
                userId: "cm9q06vs20000t65kjkf6dnov"
            }
        });

        if (!equipe) {
            return c.json({ message: "Équipe non trouvée ou non autorisée" }, 404);
        }

        const nouveauPokemon = await prisma.equipePokemon.create({
            data: {
                pokemon: String(pokemon), 
                equipeId
            }

        });

        return c.json({
            success: true,
            message: "Pokémon ajouté avec succès",
            pokemon: nouveauPokemon
        }, 201);

    } catch (error) {
        return c.json({
            success: false,
            message: "Erreur lors de l'ajout du Pokémon",
            error: error.message
        }, 400);
    }
});


equipe.delete('/equipe/:id/pokemon/:pokemonId', async (c) => {
    try {
        const session = await verifySession(c);
        if (!session) {
            return c.json({ message: "Non connecté" }, 401);
        }

        const equipeId = c.req.param('id');
        const pokemonId = c.req.param('pokemonId');

        const equipe = await prisma.equipe.findUnique({
            where: {
                id: equipeId,
                userId: session.userId
            }
        });

        if (!equipe) {
            return c.json({ message: "Équipe non trouvée ou non autorisée" }, 404);
        }

        await prisma.equipePokemon.delete({
            where: {
                id: pokemonId,
                equipeId
            }
        });

        return c.json({
            success: true,
            message: "Pokémon supprimé avec succès"
        }, 200);

    } catch (error) {
        return c.json({
            success: false,
            message: "Erreur lors de la suppression du Pokémon",
            error: error.message
        }, 400);
    }
});

export default equipe