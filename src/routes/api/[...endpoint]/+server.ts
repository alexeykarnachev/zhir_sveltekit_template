import { ServerSession } from "$lib/server";
import type { RequestHandler } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, cookies }) => {
    const endpoint = params.endpoint;
    const server_session = ServerSession.get_or_create_by_cookies(cookies);

    if (endpoint === "") {
        return new Response();
    } else {
        throw error(404);
    }
};

export const POST: RequestHandler = async ({ params, cookies, request }) => {
    const endpoint = params.endpoint;
    const server_session = ServerSession.get_or_create_by_cookies(cookies);

    if (endpoint === "ws_toast_echo") {
        const text = await request.text();
        server_session.send_ws_toast_echo(text);
        return new Response();
    } else {
        throw error(404);
    }
};
