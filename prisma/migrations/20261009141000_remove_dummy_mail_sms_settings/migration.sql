DROP TABLE `AccountToken`;

ALTER TABLE `User` DROP COLUMN `emailVerifiedAt`;

UPDATE `Company`
SET `settings` = JSON_REMOVE(
  `settings`,
  '$.mailHost',
  '$.mailPort',
  '$.mailUsername',
  '$.mailPassword',
  '$.mailEncryption',
  '$.smsProvider',
  '$.smsApiKey',
  '$.smsSenderId',
  '$.sendNotification',
  '$.newsletterEnabled'
)
WHERE `settings` IS NOT NULL;
