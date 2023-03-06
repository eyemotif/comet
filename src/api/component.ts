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
        emote: string,
    }
export enum ChatMetadata {
    None = 'none',
    Action = 'action',
}

export enum ComponentType {
    Audio = 'audio',
    Chat = 'chat'
}
