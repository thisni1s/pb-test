import moment from "moment";

export function sanitizeTime(mins : number) {
  if (mins < 60) {
    return mins+' Minuten';
  } else {
    return Math.round((mins/60) *100)/100+' Stunden';
  }
}

export function getUsernameForUserid(id: string, db: Map<string, string>) {
  const username = db.get(id)
  if(username !== undefined) {
    return username;
  } else {
    return id;
  }
}

export function formatTime(time: moment.Moment): string {
  return time.format('YYYY-MM-DD hh:mm:ss');
}

export function readableTime(time: string): string {
  return moment(time).format("DD.MM.YY");
}