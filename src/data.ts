import { ComponentType, Sound } from './component'

export type Message =
    | {
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
            data: Sound[][],
        }
    }

export type Response =
    | {
        type: 'ok'
        state: string,
    }
    | {
        type: 'data',
        state: string,
        payload: string,
    }
    | {
        type: 'error',
        state: string,
        is_internal: boolean,
        message: string,
    }
