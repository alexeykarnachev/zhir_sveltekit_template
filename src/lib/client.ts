import { writable } from "svelte/store";

export const client_session_store = writable<ClientSession | undefined>(
    undefined
);
