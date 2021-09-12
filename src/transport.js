const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');
const sendgrid = require('nodemailer-sendgrid-transport');
const postmark = require('nodemailer-postmark-transport');
const mailgun = require('nodemailer-mailgun-transport');
const stub = require('nodemailer-stub-transport');

module.exports = (env) => {
	switch (env('TRANSPORT')) {
		case 'ses':
			const AWS = require('aws-sdk');
			AWS.config.update({
				accessKeyId: env('AWS_KEY'),
				secretAccessKey: env('AWS_SECRET'),
				region: env('AWS_REGION'),
			});
			return nodemailer.createTransport(ses({ ses: new AWS.SES() }));
		case 'sendgrid':
			return nodemailer.createTransport(
				sendgrid({
					auth: {
						api_key: env('SENDGRID_API_KEY'),
					},
				})
			);
		case 'postmark':
			return nodemailer.createTransport(
				postmark({
					auth: {
						apiKey: env('POSTMARK_API_KEY'),
					},
				})
			);
		case 'mailgun':
			return nodemailer.createTransport(
				mailgun({
					auth: {
						api_key: env('MAILGUN_API_KEY'),
						domain: env('MAILGUN_DOMAIN'),
					},
				})
			);
		case 'smtp':
			//https://stackoverflow.com/a/62377331/7039250
			const smtpConfigs = {
				host: env('SMTP_HOST'),
				port: env('SMTP_PORT'),
				secure: false, // env('SMTP_SECURE') == 'true', // eslint-disable-line eqeqeq
				ignoreTLS: env('SMTP_SECURE') == 'false', // eslint-disable-line eqeqeq
				auth: {
					user: env('SMTP_USER'),
					pass: env('SMTP_PASS'),
				},
			};
			return nodemailer.createTransport(smtpConfigs);
		case 'stub':
			return nodemailer.createTransport(stub());
		default:
			console.error('No valid TRANSPORT set');
			return nodemailer.createTransport(); // direct transport
	}
};
