export enum HTTP_METHOD {
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATHC = 'PATCH',
}

export async function apicallPost(url: string, body: object) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const result = await response.json()
    console.log('call result: ', result)
    if (response.status >= 200 && response.status < 300) {
      return result
    } else {
      return null
    }
  } catch (error) {
    console.log('error sending call')
    console.error(error)
    return null
  }
}

export async function apicallGet(method: HTTP_METHOD, url: string, token: string) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: token
      }
    })
    const contentType = response.headers.get('content-type')
    if (response.status >= 200 && response.status < 300 && ((contentType?.includes('application/json')) ?? false)) {
      const result = await response.json()
      return result
    } else {
      return null
    }
  } catch (error) {
    console.log('error sending call: ', error)
    console.error(error)
    return null
  }
}
