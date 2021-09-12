const Joi = require('joi');

exports.sendEmail = ({ config = {}, body = {} }) => {
	const env = require('./utils/env')(config);
	console.log(env);
	const service = require('./email')(env);

	const schema = Joi.object().keys({
		templateName: Joi.string().required(),
		templateOptions: Joi.object().required(),
		emailOptions: Joi.object().required(),
		language: Joi.string(),
	});

	const result = schema.validate(body);
	if (result.error) {
		console.log(String(result.error) || result.error.message);
		return;
	}
	const { emailOptions, templateName, templateOptions, language } = body;
	service
		.sendTemplatedEmail(emailOptions, templateName, templateOptions, language)
		.then((response) => console.log('success response:' + response))
		.catch((err) => console.log('error ', err));
};

if (require.main === module) {
	const body = {
		language: 'en',
		templateName: 'welcome',
		templateOptions: {
			name: 'Akash',
			action_url: 'gambitier.github.io',
			login_url: 'gambitier.github.io',
			username: 'gambitier',
			trial_length: 5,
			trial_start_date: 'july-1st',
			trial_end_date: 'aug-31',
			support_email: 'csegambitier@gmail.com',
			live_chat_url: 'gambitier.github.io',
			help_url: 'gambitier.github.io',
		},
		emailOptions: {
			to: [
				'Akash <akash@yopmail.com>',
				'Akash Jadhav <akash.jadhav@yopmail.com>',
			],
		},
	};
	this.sendEmail({ body: body });
}
