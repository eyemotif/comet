import { AudioManager } from './audio/manager'

export type State = {
    connectionState: string,
    audioManager: AudioManager
}

export const State = {
    create(): State {
        const audioManager = new AudioManager()
        audioManager.loadComponents()

        return {
            connectionState: '',
            audioManager: audioManager
        }
    }
}
