module.exports.config = {
	name: "truecaller",
	version: "1.0.4",
	hasPermssion: 0,
	credits: "LIKHON AHMED",
	description: "Get Truecaller information for a phone number",
	commandCategory: "utility",
	usages: "[number]",
	cooldowns: 2,
	dependencies: {
		"axios": ""
	},
	envConfig: {}
};

module.exports.languages = {
	"en": {
		"missingNumber": "❌ Please provide a phone number\nExample: /truecaller 017xxxxxxxx",
		"fetching": "⏳ Fetching information for %1...",
		"notFound": "❌ No information found for this number",
		"error": "❌ An error occurred while fetching data",
		"result": "{\n  \"status\": \"success 🟢\",\n  \"data\": {\n    \"success\": true,\n    \"name\": \"%1\",\n    \"number\": \"%2\",\n    \"international_format\": \"%3\",\n    \"country\": \"%4\",\n    \"carrier\": \"%5\",\n    \"time\": \"%6\",\n    \"date\": \"%7\",\n    \"developer\": \"%8\"\n  },\n  \"meta\": {\n    \"response_time_ms\": %9,\n    \"http_status\": 200\n  }\n}",
		"limit": "⚠️ API rate limit exceeded. Please try again later."
	}
};

const axios = require('axios');

module.exports.onLoad = function ({ configValue }) {};

module.exports.handleReaction = function ({ api, event, models, Users, Threads, Currencies, handleReaction }) {};

module.exports.handleReply = function ({ api, event, models, Users, Threads, Currencies, handleReply }) {};

module.exports.handleEvent = function ({ event, api, models, Users, Threads, Currencies }) {};

module.exports.run = async function ({ api, event, args, models, Users, Threads, Currencies, permssion }) {
	const { threadID, messageID } = event;
	const number = args[0];
	const language = "en";

	if (!number) {
		const msg = this.languages[language].missingNumber;
		return api.sendMessage(msg, threadID, messageID);
	}

	try {
		const fetchingMsg = this.languages[language].fetching;
		api.sendMessage(fetchingMsg.replace("%1", number), threadID, messageID);

		const startTime = Date.now();
		const response = await axios.get(`https://api.lookupnow.top/api/v1/query.php?key=pk_live_393ce3e7c290520487b74955a547438c96ab7f2f&number=${number}`);
		const endTime = Date.now();
		const responseTime = endTime - startTime;

		const apiResponse = response.data;

		if (!apiResponse || !apiResponse.data || !apiResponse.data.success) {
			const notFoundMsg = this.languages[language].notFound;
			return api.sendMessage(notFoundMsg, threadID, messageID);
		}

		const data = apiResponse.data;
		const name = data.name || "N/A";
		const phone = data.number || "N/A";
		const international = data.international_format || "N/A";
		const country = data.country || "N/A";
		const carrier = data.carrier || "N/A";
		const time = data.time || "N/A";
		const date = data.date || "N/A";
		const developer = data.developer || "N/A";

		const resultTemplate = this.languages[language].result;
		const result = resultTemplate
			.replace("%1", name)
			.replace("%2", phone)
			.replace("%3", international)
			.replace("%4", country)
			.replace("%5", carrier)
			.replace("%6", time)
			.replace("%7", date)
			.replace("%8", developer)
			.replace("%9", responseTime);

		api.sendMessage(result, threadID, messageID);

	} catch (error) {
		console.error("Truecaller Error:", error);

		if (error.response && error.response.status === 429) {
			const limitMsg = this.languages[language].limit;
			return api.sendMessage(limitMsg, threadID, messageID);
		}

		const errorMsg = this.languages[language].error;
		api.sendMessage(errorMsg, threadID, messageID);
	}
};
