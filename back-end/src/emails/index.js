/**
 * Email Templates
 * ───────────────
 * Centralized exports for all email templates used across the application.
 */

const otpVerificationTemplate = require('./otpVerificationTemplate');
const emailChangedNotificationTemplate = require('./emailChangedNotificationTemplate');
const passwordChangedNotificationTemplate = require('./passwordChangedNotificationTemplate');
const passwordResetOtpTemplate = require('./passwordResetOtpTemplate');

module.exports = {
  otpVerificationTemplate,
  emailChangedNotificationTemplate,
  passwordChangedNotificationTemplate,
  passwordResetOtpTemplate,
};
