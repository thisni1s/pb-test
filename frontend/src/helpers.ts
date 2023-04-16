import moment from 'moment'

export function sanitizeTime (mins: number): string {
  if (mins < 60) {
    return String(mins) + ' Minuten'
  } else {
    return String(Math.round((mins / 60) * 100) / 100) + ' Stunden'
  }
}

export function getUsernameForUserid (id: string, db: Map<string, string>): string {
  const username = db.get(id)
  if (username !== undefined) {
    return username
  } else {
    return id
  }
}

export function formatTime (time: moment.Moment): string {
  return time.format('YYYY-MM-DD hh:mm:ss')
}

export function readableTime (time: string): string {
  return moment(time).format('DD.MM.YY')
}

export function checkNum (num: number): boolean {
  if (num > 0 && num < 1000) {
    return true
  } else {
    return false
  }
}

export function arrayHasId (arr: any[], obj: any): boolean {
  return arr.find(el => el.id === obj.id) !== undefined
}
