import { AudioManager } from './audio/manager'
import { ChatManager } from './chat/manager'
import { Feature } from './features'

export type State = {
    connectionState: string,
    audioManager: AudioManager
    chatManager: ChatManager,
    chatters: Record<string, Chatter>
    features: Feature[]
}

export type Chatter = {
    displayName: string,
    nameColor: string,
    badges: string[],
}

export const State = {
    create(): State {
        const audioManager = new AudioManager()
        audioManager.loadComponents()

        return {
            connectionState: '',
            audioManager: audioManager,
            chatManager: new ChatManager(),
            chatters: {},
            features: getFeatures(),
        }
    }
}

function getFeatures(): Feature[] {
    const url = new URL(window.location.href)

    let features: Feature[] = []
    for (const feature of Object.values(Feature)) {
        if (url.searchParams.get(feature) !== null) {
            features.push(feature)
        }
    }

    console.log('Enabled features:', features)

    return features
}
