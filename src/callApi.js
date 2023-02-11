export const METHOD_GET = 'GET';
export const METHOD_PUT = 'PUT';
export const METHOD_DELETE = 'DELETE';
export const METHOD_PATCH = 'PATCH';

export async function apicallPost(url, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    console.log('call result: ', result);
    if (response.status >= 200 && response.status < 300) {
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.log('error sending call');
    console.error(error);
    return null;
  }
}

export async function apicallGet(method, url, token) {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Accept: 'application/json',
        Authorization: token
      },
    });   
    const contentType = response.headers.get('content-type');
    if (response.status >= 200 && response.status < 300 && (contentType && contentType.indexOf('application/json') !== -1)) {
      let result = await response.json();
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.log('error sending call: ', error);
    console.error(error);
    return null;
  }
}