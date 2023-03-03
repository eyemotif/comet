import { Chat } from '../component'
import { Chatter, State } from '../state'
import { delay, Result } from '../utils'
import { chatMessageToHtml } from './builder'

type EmoteResponse = {
    provider: number
    code: string
    urls: ({ size: '1x', url: string } | { size: '2x', url: string } | { size: '4x', url: string })[]
}

export class ChatManager {
    private channelEmotes: Record<string, string> = {}
    private state: State | undefined = undefined

    setState(state: State) {
        this.state = state
    }

    async chat(userId: string, chat: Chat[]): Promise<Result<void, string>> {
        if (this.state === undefined) throw `State never set`


        const chatter = this.state.chatters[userId]
        if (chatter === undefined) {
            return Result.error(userId)
        }

        const chatDiv = document.getElementById('container-chat')!

        const chatP = document.createElement('p')
        chatP.className = 'chat'
        chatP.innerHTML += await chatMessageToHtml(chatter, chat, this.channelEmotes, this.state)

        chatDiv.appendChild(chatP)
        chatDiv.childNodes.forEach((el: any) => { if (el.getBoundingClientRect().y < 0) chatDiv.removeChild(el) })

        return Result.ok(void 0)
    }

    async setEmotes(channel: string): Promise<Result<void, string>> {
        const globalEmotes = await this.getEmotesFrom('https://emotes.adamcy.pl/v1/global/emotes/all')
        if (!globalEmotes.IsOk) {
            return globalEmotes
        }

        const channelEmotes = await this.getEmotesFrom(`https://emotes.adamcy.pl/v1/channel/${channel}/emotes/7tv.bttv.ffz`)
        if (!channelEmotes.IsOk) {
            return channelEmotes
        }

        for (const k in globalEmotes.Ok) {
            this.channelEmotes[k] = globalEmotes.Ok[k]
        }
        for (const k in channelEmotes.Ok) {
            this.channelEmotes[k] = channelEmotes.Ok[k]
        }

        return Result.ok(void 0)
    }

    private async getEmotesFrom(url: string): Promise<Result<Record<string, string>, string>> {
        let result: Record<string, string> = {}

        const response = await fetch(url)

        if (response.status === 429) {
            const retryAfter = parseFloat(response.headers.get('Retry-After')!)

            console.warn(`getEmotesFrom: Rate limited, retrying after ${retryAfter} seconds`)
            await delay(retryAfter * 1000)
            return this.getEmotesFrom(url)
        }
        else if (response.status === 400) {
            const error = await response.json()
            return Result.error(`API Error (code 400). Reason: "${error}"`)
        } else if (response.status !== 200) {
            return Result.error(`Fetch Error (code ${response.status}). Reason: "${response.statusText}`)
        }

        for (const emoteJson of await response.json()) {
            const responseJson = emoteJson as EmoteResponse
            const emoteName = responseJson.code

            let url: string | undefined = undefined
            for (const size of ['3x', '2x', '1x']) {
                const sizedUrl = (responseJson.urls).find(url => url.size == size)
                if (sizedUrl !== undefined) {
                    url = sizedUrl.url
                    break
                }
            }
            if (url === undefined) throw `Could not find URL for emote ${emoteName}`

            result[emoteName] = url
        }

        return Result.ok(result)
    }
}
