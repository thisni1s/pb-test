import { Record } from "pocketbase"
import { WorkEntry } from "./WorkEntry";

export type WTask = [Task, WorkEntry];

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
    if (record !== undefined) {
        return {
            id: record.id || '',
            title: record.title || '',
            description: record.description || '',
            creator: record.creator || '',
            claimed: record.claimed || [],
            done: record.done || false,
            username: record.username || '',
        };
    } else {
        return taskFromRecord({})
    }
    
}