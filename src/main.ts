import './styles/styles'

import { ComponentType } from './component'
import { Message, Response, ResponseBuilder } from './message'
import { State } from './state'

type Options = {
    hostUrl: string,
    port: string,
}

function parseOptions(url: URL): Options {
    return {
        hostUrl: url.searchParams.get('hosturl') ?? 'ws://' + url.hostname,
        port: url.searchParams.get('port') ?? '8000',
    }
}

window.onload = () => {
    const options = parseOptions(new URL(window.location.href))

    let state = State.create()
    state.chatManager.setState(state)

    const socket = new WebSocket(`${options.hostUrl}:${options.port}`)

    socket.onopen = function () {
        console.log('Connected to server!')

        socket.onclose = function (event) {
            console.error(`Socket closed! ${event.reason}`)
        }
    }

    socket.onmessage = async function (event) {
        const message = JSON.parse(event.data) as Message
        console.log('INBOUND', message.type, message.payload)

        const response = await onMessage(message, state)

        console.log('OUTBOUND', response.type, Response.inner(response))
        socket.send(JSON.stringify(response))
    }
}

async function onMessage(message: Message, state: State): Promise<Response> {
    const response = new ResponseBuilder(message, state)

    switch (message.type) {
        case 'register':
            state.connectionState = message.payload.state
            break
        case 'get_components':
            switch (message.payload.type) {
                case ComponentType.Audio: return response.data(state.audioManager.getAudioNames().join(', '))
                default: return response.error(`Invalid component type \"${(message.payload as any).type}\"`)
            }
        case 'play_audio':
            const audioNames = state.audioManager.getAudioNames()
            for (const outer of message.payload.data) {
                for (const inner of outer) {
                    if (!audioNames.includes(inner.name)) {
                        return response.error(`Invalid sound: \"${inner.name}\"`)
                    }
                }
            }

            state.audioManager.playAudio(message.payload.data)
            break
        case 'audio_volume':
            const tag = state.audioManager.getTagByName(message.payload.name)
            if (!tag.IsSome) {
                return response.error(`Invalid sound: \"${message.payload.name}\"`)
            }
            tag.Value.volume = message.payload.value
            break
        case 'audio_clear':
            state.audioManager.clearQueue()
            break

        case 'chat_set_emotes':
            const setEmotesResult = await state.chatManager.setEmotes(message.payload.username)
            if (!setEmotesResult.IsOk) {
                return response.internalError(setEmotesResult.Error)
            }
            break
        case 'chat':
            const chatResult = await state.chatManager.chat(message.payload.user_id, message.payload.chat)
            if (!chatResult.IsOk) {
                return response.data(chatResult.Error)
            }
            break
        case 'chat_user':
            state.chatters[message.payload.user_id] = message.payload.chat_info
            break
        case 'features':
            return response.data(JSON.stringify(state.features))
        case 'chat_clear':
            if (message.payload.user_id === null) {
                state.chatManager.clearChat()
            } else {
                state.chatManager.clearUserChat(message.payload.user_id)
            }
            break

        default: return response.error(`Invalid message type \"${(message as any).type}\"`)
    }

    return response.ok()
}
