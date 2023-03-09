export function sanitizeTime(mins : number) {
  if (mins < 60) {
    return mins+' minutes';
  } else {
    return Math.round((mins/60) *100)/100+' hours';
  }
}

export function getUsernameForUserid(id: string, authToken: string | undefined) {
  //return await apicallGet('GET', baseurl+'/api/st_users/'+id, pb.authStore.token)
  return id;
}

export function formatTime(time: moment.Moment): string {
    return time.format('YYYY-MM-DD hh:mm:ss');
}