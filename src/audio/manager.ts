import path from 'path'
import { Audio } from '../component'

type AudioFile = {
    name: string,
    resolvedPath: string,
}

export class AudioManager {
    private files: AudioFile[] = []
    private queue: Audio[][] = []

    constructor() {
        const context = require.context('.', true, /.*/)
        context.keys().forEach(file => {
            const filePath = path.parse(file)

            if (!(filePath.ext == '.mp3' || filePath.ext == '.wav' || filePath.ext == '.ogg')) {
                return
            }

            this.files.push({
                name: filePath.name,
                resolvedPath: context(file),
            })
        })
    }

    loadComponents() {
        const container = document.getElementById('container-audio')!
        for (const file of this.files) {
            let audioTag = document.createElement('audio')
            audioTag.id = `audio-${file.name}`
            audioTag.volume = 0.2
            audioTag.onended = () => this.audioDone(file.name)

            let sourceTag = document.createElement('source')
            sourceTag.src = file.resolvedPath

            audioTag.appendChild(sourceTag)
            container.appendChild(audioTag)
        }

        console.log(`Loaded Audio: ${this.files.map(audio => audio.name).join(',')}`)
    }

    playAudio(audios: Audio[][]) {
        for (const audio of audios) {
            this.queue.push(audio)
        }
        this.queueNext()
    }

    getAudioNames(): string[] {
        return this.files.map((file) => file.name)
    }

    private audioDone(name: string) {
        if (this.queue.length === 0) {
            throw 'Queue is empty'
        }

        const spotIndex = this.queue[0].findIndex((audio) => audio.name == name)
        if (spotIndex < 0) {
            throw `Audio ${name} not found in current queue spot`
        }
        this.queue[0].splice(spotIndex, 1)

        if (this.queue[0].length === 0) {
            this.queue.shift()

            if (this.queue.length > 0) {
                this.queueNext()
            }
        }

    }
    private queueNext() {
        if (this.queue.length === 0) {
            throw 'Queue is empty'
        }

        for (const audio of this.queue[0]) {
            const audioElement: HTMLAudioElement = document.getElementById(`audio-${audio.name}`)! as HTMLAudioElement
            audioElement.play()
        }
    }
}
