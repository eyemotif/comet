import { Chat, ChatMetadata } from '../api/component'
import { Chatter, State } from '../state'

type InternalChat = { type: 'internalChat', content: string } | { type: 'internalEmote', url: string }

export async function chatMessageToHtml(chatter: Chatter, message: Chat[], meta: ChatMetadata, channelEmotes: Record<string, string>, state: State): Promise<string> {
    let output = ''

    for (const badgeUrl of chatter.badges) {
        output += `<img class="badge" src="${badgeUrl}"></img>`
    }

    output += `<span class="name" style="color:${chatter.nameColor}">${chatter.displayName}</span>`
    output += `${nameSeperator(meta)}&nbsp;`
    output += '<span class="message">'

    for (const chat of message) {
        switch (chat.type) {
            case 'text':
                for (const internalChat of escapeChannelEmotes(chat.content, channelEmotes)) {
                    switch (internalChat.type) {
                        case 'internalChat':
                            output += `<span>${htmlEscape(internalChat.content)}</span>`
                            break
                        case 'internalEmote':
                            output += `<img class="emote" src="${internalChat.url}"></img>`
                            break
                    }
                }
                break
            case 'emote':
                const url = await emoteToUrl(chat.emote, state)
                output += `<img class="emote" src="${url}"></img>`
                break
            default: throw `Unknown chat type ${(chat as any).type}`
        }
    }

    return output + '</span>'
}

function nameSeperator(meta: ChatMetadata): string {
    switch (meta) {
        case ChatMetadata.None: return ':'
        case ChatMetadata.Action: return ''
    }
}

function htmlEscape(text: string): string {
    const tempDiv = document.createElement('div')
    tempDiv.innerText = text
    return tempDiv.innerHTML
}

function escapeChannelEmotes(content: string, channelEmotes: Record<string, string>): InternalChat[] {
    let output: InternalChat[] = []
    let currentWord = ''

    for (const chr of content) {
        switch (chr) {
            case ' ':
                if (channelEmotes[currentWord] !== undefined) {
                    output.push({ type: 'internalEmote', url: channelEmotes[currentWord] })
                } else {
                    output.push({ type: 'internalChat', content: currentWord += ' ' })
                }
                currentWord = ''
                break
            default:
                currentWord += chr
                break
        }
    }

    if (currentWord.length > 0) {
        if (channelEmotes[currentWord] !== undefined) {
            output.push({ type: 'internalEmote', url: channelEmotes[currentWord] })
        } else {
            output.push({ type: 'internalChat', content: currentWord += ' ' })
        }
    }

    return output
}

async function emoteToUrl(emote: string, state: State): Promise<string> {
    if (state.cachedEmotes[emote] !== undefined) {
        return state.cachedEmotes[emote]
    }

    let url: string | undefined = undefined
    for (const size of ['4.0', '3.0', '2.0', '1.0']) {
        const maybeUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emote}/default/light/${size}`
        const response = await fetch(maybeUrl, { mode: 'cors' })
        if (response.ok) {
            url = maybeUrl
            break
        }
    }

    if (url === undefined) {
        throw `Could not get URL for emote ${emote}`
    }

    state.cachedEmotes[emote] = url
    return url
}
