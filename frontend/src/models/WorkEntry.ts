export interface WorkEntry {
  id?: string
  task: string
  user: string
  minutes: number
  date: string
}

export function workEntryFromRecord(record: any): WorkEntry {
  return {
    id: record.id ?? '',
    task: record.task ?? '',
    user: record.user ?? '',
    minutes: record.minutes ?? 0,
    date: record.created ?? ''
  }
}
