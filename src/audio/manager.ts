import fs from 'fs'
import path from 'path'
import { Arr } from '../utils'

type AudioFile = {
    name: string,
    resolvedPath: string,
}

export class AudioManager {
    files: AudioFile[] = []
    queue: string[][] = []

    constructor() {
        for (const file of fs.readdirSync('*.*')) {
            const filePath = path.parse(file)

            if (filePath.ext === '.ts') {
                continue
            }

            this.files.push({
                name: filePath.name,
                resolvedPath: require(file),
            })
        }
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
    }

    playAudio(audios: string[][]) {
        for (const audio of audios) {
            this.queue.push(audio)
        }
        this.queueNext()
    }

    private audioDone(name: string) {
        if (this.queue.length === 0) {
            throw 'Queue is empty'
        }

        const spotIndex = this.queue[0].indexOf(name)
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

        for (const name of this.queue[0]) {
            const audioElement: HTMLAudioElement = document.getElementById(`audio-${name}`)! as HTMLAudioElement
            audioElement.play()
        }
    }
}
