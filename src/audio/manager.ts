import path from 'path'

type AudioFile = {
    name: string,
    resolvedPath: string,
}

export class AudioManager {
    files: AudioFile[] = []
    queue: string[][] = []

    constructor() {
        const context = require.context('.', true, /.*/)
        context.keys().forEach(file => {
            const filePath = path.parse(file)

            console.log(filePath)

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
        console.log(this.files)

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

    getAudioNames(): string[] {
        return this.files.map((file) => file.name)
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
