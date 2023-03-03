export type Audio = {
    name: string
}
export type Chat =
    | {
        type: 'text',
        content: string,
    }
    | {
        type: 'emote',
        url: string,
    }

export enum ComponentType {
    Audio = 'audio',
    Chat = 'chat'
}
