import { ComponentType } from './component'
import { Message, Response, ResponseBuilder } from './message'
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
            console.error(`Socket closed! ${event.reason}`)
        }
    }

    socket.onmessage = function (event) {
        const message = JSON.parse(event.data) as Message
        console.log('INBOUND', message)

        const response = onMessage(message, state)

        console.log('OUTBOUND', response)
        socket.send(JSON.stringify(response))
    }
}

function onMessage(message: Message, state: State): Response {
    const response = new ResponseBuilder(message, state)

    switch (message.type) {
        case 'register':
            state.connectionState = message.payload.state
            break
        case 'get_components':
            switch (message.payload.type) {
                case ComponentType.Audio: return response.internalError('get_components is not implemented')
                    break
                default: return response.error(`Invalid component type \"${(message.payload as any).type}\"`)
            }
            break
        case 'play_audio':
            return response.internalError('play_audio is not implemented')
            break

        default: return response.error(`Invalid message type \"${(message as any).type}\"`)
    }

    return response.ok()
}
