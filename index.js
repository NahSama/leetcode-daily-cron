// const core = require('@actions/core');
// const github = require('@actions/github');
const axios = require('axios')
// Just some constants
const DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/1049618392115593286/oawIhzq2oRBGonImyU7HUL22wUsIob7hcc687G3aUfX3amnv4hAW5R_hQFCi7rZcLsic'
const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql'
const DAILY_CODING_CHALLENGE_QUERY = `
query questionOfToday {
	activeDailyCodingChallengeQuestion {
		date
		userStatus
		link
		question {
			acRate
			difficulty
			freqBar
			frontendQuestionId: questionFrontendId
			isFavor
			paidOnly: isPaidOnly
			status
			title
			titleSlug
			hasVideoSolution
			hasSolution
			topicTags {
				name
				id
				slug
			}
		}
	}
}`

// We can pass the JSON response as an object to our createTodoistTask later.
const fetchDailyCodingChallenge = async () => {
    console.log(`Fetching daily coding challenge from LeetCode API.`)

    const init = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }),
    }

    const response = await axios.post(LEETCODE_API_ENDPOINT, JSON.stringify({ query: DAILY_CODING_CHALLENGE_QUERY }), {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
            "Accept-Encoding": "gzip,deflate,compress"
          },
    })

    return response;
}

async function run() {
    const json = await fetchDailyCodingChallenge();
    const question = json.data.data.activeDailyCodingChallengeQuestion;
    const formatedData = format(question);
    const webhookData = formatWebhookData(formatedData);

    await axios({
        method: 'post',
        url: DISCORD_WEBHOOK_URL,
        data: webhookData,
      })
}

function format(question) {
    return {
        date: question.date,
        link: `https://leetcode.com${question.link}`,
        title: question.question.title,
        questionId: question.question.frontendQuestionId
    }
}

function formatWebhookData(formatedData) {
    return {
        "content": `> **${formatedData.date}**\n${formatedData.questionId}. ${formatedData.title}\n${formatedData.link}`,
        "embeds": null,
        "attachments": []
    }
}


run();
