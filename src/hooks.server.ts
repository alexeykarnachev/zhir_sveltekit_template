import { ServerSession } from "$lib/server";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const server_session = ServerSession.get_or_create_by_cookies(
        event.cookies
    );

    return await resolve(event);
};
