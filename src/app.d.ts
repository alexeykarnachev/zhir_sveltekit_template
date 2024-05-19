// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    type WSMessageType = "ClientSession" | "ToastNotification";
    type ToastNotificationLevel = "success" | "error";

    type WSMessage = {
        type: WSMessageType;
        data: any;
    };

    type ToastNotification = {
        text: string;
        level: ToastNotificationLevel;
    };

    type ClientSession = {
        id: string;
    };
}

export {};
