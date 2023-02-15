import { Record } from "pocketbase"

export type Task = {
    id?: string
    title: string,
    description: string,
    creator: string,
    claimed: string[],
    spend_minutes: number | string,
}

export function taskFromRecord(record: any): Task {
    return {
        id: record.id || '',
        title: record.title || '',
        description: record.description || '',
        creator: record.creator || '',
        claimed: record.claimed || [],
        spend_minutes: record.spend_minutes || 0,
    };
}