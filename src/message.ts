import { ComponentType, Audio, Chat } from './component'
import { Chatter, State } from './state'

export type Message =
    ({
        type: 'register',
        payload: {
            state: string,
        }
    }
        | {
            type: 'get_components',
            payload: {
                type: ComponentType,
            }
        }
        | {
            type: 'play_audio',
            payload: {
                data: Audio[][],
            }
        }
        | {
            type: 'audio_volume',
            payload: {
                name: string,
                value: number,
            }
        }
        | {
            type: 'audio_clear',
            payload: {}
        }
        | {
            type: 'chat_set_emotes',
            payload: {
                username: string,
            }
        }
        | {
            type: 'chat',
            payload: {
                user_id: string,
                chat: Chat[],
            }
        }
        | {
            type: 'chat_user',
            payload: {
                user_id: string,
                chat_info: Chatter
            },
        }
        | {
            type: 'features',
            payload: {}
        }
        | {
            type: 'chat_clear',
            payload: {
                user_id: string | null
            }
        }
    ) & { tag: string }

export type Response =
    | {
        type: 'ok',
        tag: string,
        state: string,
    }
    | {
        type: 'data',
        tag: string,
        state: string,
        payload: string,
    }
    | {
        type: 'error',
        tag: string,
        state: string,
        is_internal: boolean,
        message: string,
    }

export class ResponseBuilder {
    msg: Message
    state: State

    constructor(msg: Message, state: State) {
        this.msg = msg
        this.state = state
    }

    ok(): Response {
        return {
            type: 'ok',
            tag: this.msg.tag,
            state: this.state.connectionState,
        }
    }
    data(payload: string): Response {
        return {
            type: 'data',
            tag: this.msg.tag,
            state: this.state.connectionState,
            payload,
        }
    }
    error(message: string): Response {
        return {
            type: 'error',
            tag: this.msg.tag,
            state: this.state.connectionState,
            is_internal: false,
            message,
        }
    }
    internalError(message: string): Response {
        return {
            type: 'error',
            tag: this.msg.tag,
            state: this.state.connectionState,
            is_internal: true,
            message,
        }
    }
}

export const Response = {
    inner(response: Response) {
        switch (response.type) {
            case 'ok': return {}
            case 'data': return { payload: response.payload }
            case 'error': return { is_internal: response.is_internal, message: response.message }
        }
    }
}
