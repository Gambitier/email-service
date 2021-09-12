const prefix = 'EMAIL_';
const defaults = {
	DEFAULT_FROM: '',
	DEFAULT_LANGUAGE: 'en',
	TRANSPORT: 'smtp',
	SMTP_HOST: '',
	SMTP_PORT: 587,
	SMTP_SECURE: 'true',
	SMTP_USER: '',
	SMTP_PASS: '',
	TEMPLATES_DIR: 'templates',
};

module.exports =
	(env = {}) =>
	(key, defaultValue) => {
		return [
			env[prefix + key],
			env[key],
			process.env[prefix + key],
			process.env[key],
			defaultValue,
			defaults[key],
		].find((value) => value != null);
	};
