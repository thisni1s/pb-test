export type Task = {
    id?: string
    title: string,
    description: string,
    creator: string,
    claimed: string,
    spend_minutes: number | string,
}