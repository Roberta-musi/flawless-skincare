INSERT INTO `settings` (`id`, `business_name`, `slogan_en`, `slogan_fr`, `announcement_en`, `announcement_fr`, `city`, `region`, `country`, `socials`, `updated_at`)
VALUES (
  1,
  'Flawless Skin Care',
  'The secret for a glowing skin',
  'Le secret d''une peau éclatante',
  'Order easily on WhatsApp · Skin consultations in Limbe and online',
  'Commandez facilement sur WhatsApp · Consultations à Limbe et en ligne',
  'Limbe',
  'South West',
  'CM',
  '{}',
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
);
--> statement-breakpoint
INSERT INTO `brand_profile` (`id`, `ceo_socials`, `updated_at`)
VALUES (1, '{}', CAST(strftime('%s', 'now') AS INTEGER) * 1000);
--> statement-breakpoint
INSERT INTO `content_pages` (`slug`, `title_en`, `title_fr`, `body_en`, `body_fr`, `updated_at`)
VALUES (
  'privacy',
  'Privacy notice',
  'Politique de confidentialité',
  '## Who we are
Flawless Skin Care is a skincare business in Limbe, Cameroon. This notice explains how we handle the personal details you share through this website.

## What we collect
- **Booking requests:** your name, WhatsApp number, optional email, preferred dates, and anything you choose to tell us about your skin.
- **Reviews:** your name, town or country, rating and review.
- **Messages:** your name, contact details and message.
- **Orders:** the website does not store your bag. Sending an order opens WhatsApp with your list, and you decide whether to send it.

## Why we use it
Only to respond to you: confirming appointments, answering messages, and publishing the reviews you have agreed to share. We do not sell your details or use them for advertising.

## Who can see it
Only the Flawless Skin Care team, through a password-protected admin area. The website is hosted by Cloudflare, and notification emails are sent through Resend.

## How long we keep it
We keep booking requests and messages only as long as we need them to handle your request and keep our records. Published reviews stay online until you ask us to remove them.

## Your rights
You can ask us to show, correct or delete your details at any time. Contact us on WhatsApp or by email and we will respond promptly.

## Analytics
We use Cloudflare Web Analytics, which does not use cookies or follow you across other websites.',
  '## Qui sommes-nous
Flawless Skin Care est une entreprise de soins de la peau située à Limbe, au Cameroun. Cette politique explique comment nous traitons les informations personnelles que vous partagez sur ce site.

## Ce que nous collectons
- **Demandes de rendez-vous :** votre nom, votre numéro WhatsApp, votre e-mail (facultatif), vos dates souhaitées et ce que vous choisissez de nous dire sur votre peau.
- **Avis :** votre nom, votre ville ou pays, votre note et votre avis.
- **Messages :** votre nom, vos coordonnées et votre message.
- **Commandes :** le site n''enregistre pas votre panier. L''envoi d''une commande ouvre WhatsApp avec votre liste, et vous décidez de l''envoyer ou non.

## Pourquoi nous les utilisons
Uniquement pour vous répondre : confirmer vos rendez-vous, répondre à vos messages et publier les avis que vous avez accepté de partager. Nous ne vendons pas vos données et ne les utilisons pas à des fins publicitaires.

## Qui peut les voir
Uniquement l''équipe Flawless Skin Care, via un espace d''administration protégé par mot de passe. Le site est hébergé par Cloudflare et les e-mails de notification sont envoyés via Resend.

## Combien de temps nous les conservons
Nous conservons les demandes de rendez-vous et les messages uniquement le temps nécessaire pour traiter votre demande et tenir nos registres. Les avis publiés restent en ligne jusqu''à ce que vous demandiez leur retrait.

## Vos droits
Vous pouvez à tout moment nous demander de consulter, corriger ou supprimer vos informations. Contactez-nous sur WhatsApp ou par e-mail et nous vous répondrons rapidement.

## Mesure d''audience
Nous utilisons Cloudflare Web Analytics, qui n''utilise pas de cookies et ne vous suit pas sur d''autres sites.',
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
);
--> statement-breakpoint
INSERT INTO `content_pages` (`slug`, `title_en`, `title_fr`, `body_en`, `body_fr`, `updated_at`)
VALUES (
  'booking-policy',
  'Booking and cancellation policy',
  'Conditions de réservation et d''annulation',
  '## Requesting an appointment
A booking request made on this website is not yet a confirmed appointment. We contact you on WhatsApp to agree a date and time, and your appointment is confirmed once we have both agreed.

## Changing or cancelling
If you need to change or cancel your appointment, please tell us on WhatsApp as early as possible so we can offer the time to someone else.',
  '## Demander un rendez-vous
Une demande faite sur ce site n''est pas encore un rendez-vous confirmé. Nous vous contactons sur WhatsApp pour convenir d''une date et d''une heure, et votre rendez-vous est confirmé une fois que nous sommes d''accord.

## Modifier ou annuler
Si vous devez modifier ou annuler votre rendez-vous, prévenez-nous sur WhatsApp le plus tôt possible afin que nous puissions proposer ce créneau à quelqu''un d''autre.',
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
);
--> statement-breakpoint
INSERT INTO `content_pages` (`slug`, `title_en`, `title_fr`, `body_en`, `body_fr`, `updated_at`)
VALUES (
  'returns',
  'Returns',
  'Retours',
  'Our returns policy is being finalised. If you have a question about an order, please message us on WhatsApp.',
  'Notre politique de retour est en cours de finalisation. Pour toute question sur une commande, écrivez-nous sur WhatsApp.',
  CAST(strftime('%s', 'now') AS INTEGER) * 1000
);
