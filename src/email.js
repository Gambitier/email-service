const juice = require('juice');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const createTransport = require('./transport');

module.exports = (env) => {
	const defaultLanguage = env('DEFAULT_LANGUAGE', 'en');
	const defaultEmailFrom = env('DEFAULT_FROM');
	const templatesDir = env('TEMPLATES_DIR');
	const transporter = createTransport(env);
	const service = {};

	const fullPath = (relativePath) => path.join(templatesDir, relativePath);

	const fileExists = (fullPath) =>
		new Promise((resolve, reject) => {
			if (!fullPath.startsWith(templatesDir + path.sep))
				return reject(new Error('Invalid template path'));
			fs.access(fullPath, fs.constants.R_OK, (err) => resolve(!err));
		});

	const renderEjs = async (filename, data) => {
		const html = await ejs.renderFile(filename, data, { async: true });
		return html;
	};

	const processIfExists = async (filename, data, func) => {
		const exists = await fileExists(filename);
		if (exists) return func(filename, data);
		else throw new Error(`file ${filename} is not readable`);
	};

	service.processTemplate = async (
		template,
		templateOptions,
		lang = defaultLanguage
	) => {
		const pathEjsSubject = fullPath(path.join(lang, template, 'subject.ejs'));
		const pathEjsHtmlBody = fullPath(
			path.join(lang, template, 'body-html.ejs')
		);

		const [ejsHtmlBody, ejsSubject] = await Promise.all([
			processIfExists(pathEjsHtmlBody, templateOptions, renderEjs),
			processIfExists(pathEjsSubject, templateOptions, renderEjs),
		]);

		return {
			subject: (ejsSubject || '').trim(),
			// The HTML output of the template is passed
			// through juice for inlining the CSS styles.
			html: juice(ejsHtmlBody || ''),
			text: '',
		};
	};

	service.sendMail = async (mailOptions) => {
		console.log('sending email');
		mailOptions.from = mailOptions.from || defaultEmailFrom;
		const info = await transporter.sendMail(mailOptions);
		console.log('mail sent, info: \n', info);
	};

	service.sendTemplatedEmail = (
		mailOptions,
		template,
		templateOptions,
		lang
	) => {
		return service
			.processTemplate(template, templateOptions, lang)
			.then((opts) => {
				const options = Object.assign({}, mailOptions, opts);
				return service.sendMail(options);
			});
	};

	return service;
};
