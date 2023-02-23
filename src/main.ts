import { ComponentType } from './component'
import { Message, Response } from './message'
import { State } from './state'

type Options = {
    hostUrl: string,
    port: string,
}

function parse_options(url: URL): Options {
    return {
        hostUrl: url.searchParams.get('hosturl') ?? 'ws://localhost',
        port: url.searchParams.get('port') ?? '8000',
    }
}

window.onload = () => {
    const options = parse_options(new URL(window.location.href))

    let state: State = {
        connectionState: ''
    }
    const socket = new WebSocket(`${options.hostUrl}:${options.port}`)

    socket.onopen = function () {
        console.log('Connected to server!')

        socket.onclose = function (event) {
            console.error(`Socket closed! reason: ${event.reason}`)
        }
    }

    socket.onmessage = function (event) {
        const message = event.data as Message

        onMessage(message, state)
    }
}

function onMessage(message: Message, state: State): Response {
    switch (message.type) {
        case 'register':
            state.connectionState = message.payload.state
            break
        case 'get_components':
            switch (message.payload.type) {
                case ComponentType.Audio: return {
                    type: 'error',
                    state: state.connectionState,
                    is_internal: true,
                    message: 'get_components: audio not implemented'
                }
                    break
            }
            break
        case 'play_audio':
            return {
                type: 'error',
                state: state.connectionState,
                is_internal: true,
                message: 'play_audio not implemented'
            }
            break
    }

    return {
        type: 'ok',
        state: state.connectionState
    }
}
