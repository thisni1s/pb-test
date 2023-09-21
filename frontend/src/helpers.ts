import moment from 'moment'
import { apicallGet, HTTP_METHOD } from './callApi'
import config from './config.json'

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

export async function apiClaimTask(taskid: string, token: string): Promise<void> {
  console.log('claiming task')
  await apicallGet(HTTP_METHOD.GET, config.baseUrl+'/api/st_tasks/claim/'+taskid, token)
}

export async function apiFinishTask(taskid: string, token: string): Promise<void> {
  console.log('finishing task')
  await apicallGet(HTTP_METHOD.GET, config.baseUrl+'/api/st_tasks/finish/'+taskid, token)
} 

export function formatTime (time: moment.Moment): string {
  return time.format('YYYY-MM-DD hh:mm:ss')
}

export function formatUploadTime(time: moment.Moment): string {
  return time.format('YYYY-MM-DD hh:mm:ss.SSSZ')
}

export function parseUploadTime(time: string): moment.Moment {
  return moment(time, 'YYYY-MM-DD hh:mm:ss.SSSZ')
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

export function getGermanErrorNames(str: string): string {
  switch (str) {
    case "Failed to authenticate.":
      return "Falscher Nutzername oder falsches Passwort!"
    case "The username is invalid or already in use.":
      return "Der Nutzername ist ungültig oder schon vergeben!"
    default:
      return str;
  }
}
