# Privacy Policy — Maid Tracker

_Last updated: 15 May 2026_

This Privacy Policy describes how Maid Tracker ("the App", "we", "our") handles your information when you use our mobile application.

## 1. Information we collect

When you create an account, we collect:

- **Email address** — used to identify your account and let you sign in across devices.
- **Password** — stored securely by Google Firebase Authentication. We do not see or store your password directly.
- **App data you enter** — the names of your staff members, the categories you define (e.g. lunch, cleaning), attendance toggles per day, and the rates you configure.
- **Household membership** — if you invite family members to share data, we record which user accounts are part of which shared household, along with the role (owner or member) and join date. We do not record who specifically made any individual edit.

We do **not** collect:

- Real names or contact details of your staff (we recommend you only enter a label like "Maid", "Cook", a first name, or a nickname).
- Location data.
- Photos, contacts, microphone, or any device sensors.
- Advertising identifiers.
- Analytics or behavioural tracking.

## 2. How we use your information

- To let you sign in and sync your data across devices you own.
- To keep your attendance and rate data backed up so you don't lose it if your phone is lost or replaced.
- To send you a password reset email, if you request one.
- To enable family sharing: if you create or join a shared household using a 6-digit invite code, all current members of that household can read and write the same staff, categories, and attendance data. Your email address is visible to other members of your household so they can identify who joined. You can leave a household at any time from **Settings → Family sharing → Leave family**, and owners can remove members.

We do not sell, rent, or share your information with third parties for advertising or marketing purposes.

## 3. Where your data is stored

Your account data is stored in **Google Firebase** (Authentication and Cloud Firestore), operated by Google LLC. Firebase's data handling is governed by the [Google Cloud Privacy Notice](https://cloud.google.com/terms/cloud-privacy-notice).

A local copy of your data is also kept on your device so the app works offline.

## 4. Data retention and deletion

You can delete your account from inside the app at any time:

> **Settings → Delete account**

When you delete your account:

- Your authentication record is removed from Firebase Auth.
- Your user profile document is permanently deleted from Cloud Firestore.
- If you are the **sole member** of a household, the entire household and its data are deleted alongside your account.
- If you are a **member of a shared household with other people**, you are removed from the household; the household and its data continue to exist for the remaining members. If you were the owner, ownership is transferred to the next-oldest member.
- Your local on-device cache is cleared.
- When you join a different family while you were the sole member of your previous household, your old household data is archived for 30 days (recoverable on request) and then permanently deleted.

This action is **irreversible**.

If you cannot access the app and want your data deleted, email us at the contact address below and we will process the request within 30 days.

## 5. Children

Maid Tracker is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has created an account, contact us and we will delete it.

## 6. Security

- Passwords are managed by Firebase Authentication and never sent to us in plain text.
- Data in transit is encrypted using HTTPS / TLS.
- Firestore access rules restrict shared household data so that only authenticated members of that household can read or write it. Personal profile data (email, household pointer) is restricted to the account owner.

No system is perfectly secure. You are responsible for keeping your login credentials confidential.

## 7. Your rights

Depending on where you live, you may have the right to:

- Access the data we hold about you.
- Correct inaccurate data.
- Delete your data (you can do this directly in the app).
- Export your data.

To exercise any of these rights, contact us at the email below.

## 8. Changes to this policy

We may update this policy from time to time. The "Last updated" date at the top reflects the most recent change. Material changes will be highlighted in-app.

## 9. Contact

For privacy questions or data requests:

**Email:** ai@lenskart.com

---

_This policy is provided as a starting template. If you operate the app commercially, in the EU/UK, or process data on behalf of others, consult a lawyer to confirm compliance with applicable laws (GDPR, India DPDP Act, etc.)._
