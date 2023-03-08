import { Record } from "pocketbase"

export type WorkEntry = {
    id?: string
    task: string,
    user: string,
    minutes: number,
}

export function workEntryFromRecord(record: any): WorkEntry {
    return {
        id: record.id || '',
        task: record.task || '',
        user: record.user || '',
        minutes: record.minutes || 0,
    };
}