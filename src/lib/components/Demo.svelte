<script lang="ts">
    import { client_session_store } from "$lib/client";

    async function echo_ws() {
        await fetch("/api/ws_toast_echo", {
            method: "POST",
            body: "Echo WS"
        });
    }
</script>

<div class="flex flex-col gap-2 m-2">
    <p class="border border-primary-500 p-2">
        My session-id (provided by server, saved in cookies):
        <b>{$client_session_store?.id}</b>
    </p>

    <button class="btn variant-filled-primary" on:click={echo_ws}>
        WS Toast Echo (asks server to send a message via WebSocket)
    </button>
</div>
