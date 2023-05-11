import { type WorkEntry } from './WorkEntry'

export type WTask = [Task, WorkEntry]

export interface Task {
  id?: string
  title: string
  description: string
  creator: string
  username: string
  claimed: string[]
  done: boolean
  private: boolean
  image?: string
}

export function taskFromRecord(record: any): Task {
  if (record !== undefined) {
    return {
      id: record.id ?? '',
      title: record.title ?? '',
      description: record.description ?? '',
      creator: record.creator ?? '',
      claimed: record.claimed ?? [],
      done: record.done ?? false,
      username: record.username ?? '',
      private: record.private ?? false,
      image: record.image || undefined // the OR operator is intentional!!!
    }
  } else {
    return taskFromRecord({})
  }
}
