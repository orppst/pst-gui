import {notifications} from "@mantine/notifications";

function notify(title: string, message: string, colour: string) {
    notifications.show({
        title: title,
        message: message,
        autoClose: colour==='green'?5000:7000,
        color: colour
    });
}

export function notifyError(title: string, message: string) {
    notify(title, message,"red");
}

export function notifyInfo(title: string, message: string) {
    notify(title, message,"blue");
}

export function notifySuccess(title: string, message: string) {
    notify(title, message,"green");
}