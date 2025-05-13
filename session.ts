import { SignJWT, jwtVerify } from "jose";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { env } from "hono/adapter";

const key = new TextEncoder().encode(process.env.SECRET_KEY || 'default-secret-key');

const cookie ={
    name: "session",
    options: {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        path: "/"
    },
    duration: 60 * 60 * 24 * 30,
}

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .sign(key);
}



export async function decrypt(session: string) {
    try {
        const { payload } = await jwtVerify(session, key, { algorithms: ["HS256"] });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(c: any, userId: string) {
    const expires = new Date(Date.now() + cookie.duration * 1000);
    const session = await encrypt({
        userId,
        expires
    });

    setCookie(c, cookie.name, session, {...cookie.options, expires});
}

export async function verifySession(c: any) {
    const sessionCookie = getCookie(c, cookie.name);
    console.log('ejfdkefjdk', sessionCookie)
    if (!sessionCookie) return null;
    const session = await decrypt(sessionCookie);
    console.log(session)

    if (!session) {
        return null;
    }
    return {userId: session};
}

export async function deleteSession(c: any) {
    const sessionCookie = getCookie(c, cookie.name);
    if (!sessionCookie) return null;
    const session = await decrypt(sessionCookie);
    deleteCookie(c, cookie.name);
    return {userId: session?.userId};
}

