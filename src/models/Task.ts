import { Record } from "pocketbase"

export type Task = {
    id?: string
    title: string,
    description: string,
    creator: string,
    username: string,
    claimed: string[],
    done: boolean,
}

export function taskFromRecord(record: any): Task {
    return {
        id: record.id || '',
        title: record.title || '',
        description: record.description || '',
        creator: record.creator || '',
        claimed: record.claimed || [],
        done: record.done || false,
        username: record.username || '',
    };
}