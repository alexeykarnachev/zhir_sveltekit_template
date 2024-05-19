<script lang="ts">
    import {
        getToastStore,
        initializeStores,
        Toast
    } from "@skeletonlabs/skeleton";
    import { PUBLIC_WS_PATH } from "$env/static/public";
    import { client_session_store } from "$lib/client";
    import { onMount } from "svelte";
    import "../app.css";

    initializeStores();
    const toast_store = getToastStore();

    function create_ws() {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const url = `${protocol}//${location.hostname}${PUBLIC_WS_PATH}`;
        const ws = new WebSocket(url);

        ws.addEventListener("open", (_) => {
            console.info("Ws connection is opened");
        });

        ws.addEventListener("close", (_) => {
            console.info("Ws connection is closed");
        });

        ws.addEventListener("message", (event) => {
            const message: WSMessage = JSON.parse(event.data);
            switch (message.type) {
                case "ClientSession":
                    $client_session_store = message.data;
                    break;
                case "ToastNotification":
                    const notification: ToastNotification = message.data;
                    let background = `variant-filled-${notification.level}`;
                    toast_store.trigger({
                        message: notification.text,
                        background
                    });
                    break;
                default:
                    console.error(`Unknown ws message type: ${message.type}`);
                    break;
            }
        });
    }

    onMount(async () => {
        create_ws();
    });
</script>

<Toast />
<slot />
