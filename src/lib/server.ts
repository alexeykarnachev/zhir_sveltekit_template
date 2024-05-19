import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import cookie from "cookie";
import { building } from "$app/environment";
import { SESSION_ID_COOKIE_NAME, WSS_PORT } from "$env/static/private";
import { error, type Cookies } from "@sveltejs/kit";
import uuid4 from "uuid4";

// In-memory Sessions db
// Replace this if needed with real db
const SESSIONS: { [key: string]: ServerSession } = {};

// -----------------------------------------------------------------------
// WebSocket server
if (!building) {
    const wss = new WebSocketServer({ port: Number(WSS_PORT) });
    wss.on("connection", wss_on_connection);

    console.info(`WebSocketServer is started on port: ${WSS_PORT}`);
}

function wss_on_connection(socket: WebSocket, request: IncomingMessage) {
    const cookies = request.headers.cookie;
    if (!cookies) {
        console.warn(
            "New ws connection created, but cookies are undefined. Closing socket."
        );
        socket.close();
        return;
    }

    const session_id = cookie.parse(cookies)[SESSION_ID_COOKIE_NAME];
    if (!session_id) {
        console.warn(
            `New ws connection created, but '${SESSION_ID_COOKIE_NAME}' cookie is undefined. Closing socket.`
        );
        socket.close();
        return;
    }

    const session: ServerSession | undefined = SESSIONS[session_id];
    if (!session) {
        console.warn(
            `New ws connection created and '${SESSION_ID_COOKIE_NAME}' cookie is provided, but session with this id doesn't exist. Closing socket.`
        );
        socket.close();
        return;
    }

    session.set_ws(socket);
    console.info(
        `New ws connection created for session with id: ${session_id}`
    );

    session.send_self_to_client();
}

// -----------------------------------------------------------------------
// Session
export class ServerSession {
    /**
     * Retrieves an existing ServerSession instance based on the provided cookies,
     * or creates a new session if none exists.
     *
     * @param cookies - The cookies containing session information.
     * @returns The ServerSession instance associated with the provided cookies.
     */
    static get_or_create_by_cookies(cookies: Cookies): ServerSession {
        let id = cookies.get(SESSION_ID_COOKIE_NAME);
        if (!id || !SESSIONS[id]) {
            do {
                id = uuid4();
            } while (SESSIONS[id]);

            cookies.set(SESSION_ID_COOKIE_NAME, id, {
                path: "/",
                secure: false
            });

            SESSIONS[id] = new ServerSession(id);
            console.info(`New session created: ${id}`);
        }

        return SESSIONS[id];
    }

    private ws?: WebSocket;
    private id: string;

    private constructor(id: string) {
        this.id = id;
    }

    as_client_session(): ClientSession {
        return {
            id: this.id
        };
    }

    set_ws(ws: WebSocket) {
        this.ws = ws;
    }

    private send_ws_message(message: WSMessage) {
        if (!this.ws) {
            throw error(
                500,
                "Failed to send ws message, session's ws is undefined"
            );
        }

        this.ws.send(JSON.stringify(message));
        console.info(`WSMessage of type '${message.type}' is sent to client`);
    }

    private send_ws_toast_notification(
        text: string,
        level: ToastNotificationLevel
    ) {
        const data: ToastNotification = { text, level };
        this.send_ws_message({ type: "ToastNotification", data });
    }

    /**
     * Sends the client version of itself to the client via ws.
     */
    send_self_to_client() {
        this.send_ws_message({
            type: "ClientSession",
            data: this.as_client_session()
        });
    }

    /**
     * Sends echo toast notification via ws
     */
    send_ws_toast_echo(text: string) {
        this.send_ws_toast_notification(text, "success");
    }
}
