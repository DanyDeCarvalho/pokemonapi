import { MiddlewareHandler } from 'hono';
import { verifySession } from './session'; 

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = await verifySession(c);

  if (!session) {
    return c.json({ message: 'Non connecté' }, 401);
  }

  c.set('session', session); 
  await next();
};
