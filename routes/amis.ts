import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { verifySession } from "../session";



const amis = new Hono();
const prisma = new PrismaClient();

amis.post('/demandeAmis', async (c) => {
    try {
        const { username } = await c.req.json()
        const demandeur = await verifySession(c);
        if (!demandeur) {
            return c.json({ message: "Non connecté" }, 401);
        }
        const user = await prisma.user.findUnique({
            where: { username },
        })

        if (!user) {
            return c.json({ message: "Utilisateur non trouvé" }, 404);
        }

        const demandeAmis = await prisma.demandeAmis.create({
            data: {
                demandeurId: demandeur.userId,
                destinataireId: user.id
            }
        })

        return c.json({
            success: true,
            message: "Demande envoyée"
        }, 201);

    } catch (error) {
        return c.json({
            success: false,
            message: "Erreur demande d amis non envoyée",
            error: error.message
        }, 400);
    }

}
)

amis.post('/reponseDemande', async (c) => {
    try {
        const { demandeAmisId, statut } = await c.req.json();

        const demandeAmis = await prisma.demandeAmis.findUnique({
            where: { id: demandeAmisId }
        })

        if (!demandeAmis) {
            return c.json({ message: "demande amis non trouvée" }, 404);
        }

        await prisma.demandeAmis.update({
            where: { id: demandeAmisId },
            data: { statut }
        })

        return c.json({
            success: true,
            message: "Demande maj"
        }, 201);
    } catch (error) {
        return c.json({
            success: false,
            message: "Erreur lors de maj demande",
            error: error.message
        }, 400);
    }
})

amis.get('demandeAmis', async (c) => {
    const session = await verifySession(c);

    const userId = session?.userId

    const demandeAmis = await prisma.demandeAmis.findMany({
        where: {
            destinataireId: userId,
            statut: "ATTENTE"
        },
        include: {
            demandeur: {
                select: {
                    id: true,
                    username: true
                }
            },
            destinataire: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    })

    return c.json(demandeAmis);
})

amis.get('/equipes', async (c) => {
    const session = await verifySession(c);
    if (!session) {
        return c.json({ message: "Non connecté" }, 401);
    }

    const equipes = await prisma.equipe.findMany({
        where: {
            userId: session.userId
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

amis.delete('/equipe/:id', async (c) => {
    try {
        const session = await verifySession(c);
        if (!session) {
            return c.json({ message: "Non connecté" }, 401);
        }

        const equipeId = c.req.param('id');

        // Vérifier que l'équipe appartient à l'utilisateur
        const equipe = await prisma.equipe.findUnique({
            where: {
                id: equipeId,
                userId: session.userId
            }
        });

        if (!equipe) {
            return c.json({ message: "Équipe non trouvée ou non autorisée" }, 404);
        }

        // Supprimer l'équipe (les Pokémon associés seront supprimés automatiquement grâce à la relation)
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

amis.post('/equipe/:id/pokemon', async (c) => {
    try {
        const session = await verifySession(c);
        if (!session) {
            return c.json({ message: "Non connecté" }, 401);
        }

        const equipeId = c.req.param('id');
        const { pokemon } = await c.req.json();

        // Vérifier que l'équipe appartient à l'utilisateur
        const equipe = await prisma.equipe.findUnique({
            where: {
                id: equipeId,
                userId: session.userId
            }
        });

        if (!equipe) {
            return c.json({ message: "Équipe non trouvée ou non autorisée" }, 404);
        }

        // Ajouter le Pokémon à l'équipe
        const nouveauPokemon = await prisma.equipePokemon.create({
            data: {
                pokemon,
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

amis.delete('/equipe/:id/pokemon/:pokemonId', async (c) => {
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

export default amis

