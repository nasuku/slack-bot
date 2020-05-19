const logger = require('./logger')
const fetch = require("node-fetch");
const slackWorkspaces = require('./slack-status-config')
const {ENDPOINT} = require('./config')

async function updateSlackStatus(isInMeeting) {
    let status_text = ""
    let status_emoji = ""
    if (isInMeeting) {
        status_text = slackWorkspaces.meetingStatus.text
        status_emoji = slackWorkspaces.meetingStatus.emoji
    } else {
        status_text = slackWorkspaces.noMeetingStatus.text
        status_emoji = slackWorkspaces.noMeetingStatus.emoji
    }
    const data = JSON.stringify(        {
                profile: {
                    status_text: status_text || '',
                    status_emoji: status_emoji || '',
                    status_expiration: 0,
                }

        })

    const options = {
        method: 'POST',
        body: data,
        headers: {
            'Authorization': 'Bearer ' + SLACK_TOKEN,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };
    req = fetch(ENDPOINT, options)
    logger('fetch created', req);

    await req.then(res => {
        r = res.json()
        logger("fetch request response", r)
        return r // this is the json response Promise on which we are waiting at line 37
    }).catch(err => {
        logger('fetch err', err)
        throw (err)
    })
}

module.exports = updateSlackStatus
