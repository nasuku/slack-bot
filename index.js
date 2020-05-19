const Router = require('./router')
const logger = require('./logger')
const updateSlackStatus = require('./slack')
const { ZOOM_IN_MEETING_STATUS } = require('./config')

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handler(request) {
    logger('ZOOM request', request.body)
    const init = {
        headers: {'content-type': 'application/json'},
    }
    var requestBody = await readRequestBody(request)
    logger('readRequestBody', requestBody)

    var obj = JSON.parse(requestBody);
    logger('parsed readRequestBody', obj)

    const currentPresenceStatus = obj.payload.object.presence_status
    console.log(obj.payload.object.presence_status)

    if (!currentPresenceStatus) {
        return new Response('presence_status is not available')
    }
    logger('presence status request', currentPresenceStatus)
    const isInMeeting = currentPresenceStatus === ZOOM_IN_MEETING_STATUS
    try {
        resp = await updateSlackStatus(isInMeeting)
        logger(
            'SLACK updated',
            `new slack status '${isInMeeting ? 'in meeting' : 'not in meeting'}'`,
        )
        return new Response('updated slack:', {
            status: 200,
            statusText: resp,
        })

    } catch (err) {
        logger('updateslackStatus gave err',err)

        return new Response('error updating slack', {
            status: 404,
            statusText: err,
            headers: {
                'content-type': 'text/plain',
            },
        })
    }
}

async function handleRequest(request) {
    const r = new Router()
    r.post('/zoomStatusUpdate', request => handler(request))
    r.get('/', () => new Response('I am online!')) // return a default message for the root route
    const resp = await r.route(request)
    return resp
}


async function readRequestBody(request) {
    const {headers} = request
    const contentType = headers.get('content-type')
    if (contentType.includes('application/json')) {
        const body = await request.json()
        return JSON.stringify(body)
    } else if (contentType.includes('application/text')) {
        const body = await request.text()
        return body
    } else if (contentType.includes('text/html')) {
        const body = await request.text()
        return body
    } else if (contentType.includes('form')) {
        const formData = await request.formData()
        let body = {}
        for (let entry of formData.entries()) {
            body[entry[0]] = entry[1]
        }
        return JSON.stringify(body)
    } else {
        let myBlob = await request.blob()
        var objectURL = URL.createObjectURL(myBlob)
        return objectURL
    }
}

