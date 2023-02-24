import { ComponentType, Sound } from './component'
import { State } from './state'

export type Message =
    | {
        type: 'register',
        tag: string,
        payload: {
            state: string,
        }
    }
    | {
        type: 'get_components',
        tag: string,
        payload: {
            type: ComponentType,
        }
    }
    | {
        type: 'play_audio',
        tag: string,
        payload: {
            data: Sound[][],
        }
    }

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
