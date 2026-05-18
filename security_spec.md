# Lumina Learning Security Specification

## Data Invariants
1. A document must belong to the authenticated user who uploaded it.
2. A quiz must be associated with a valid document ID owned by the user.
3. Progress records are immutable once created and must reflect the correct user score.
4. User profiles are private and only accessible by the owner.

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Attempt to create a document with `userId: "other_user"`.
2. **Shadow Field Injection**: Attempt to add `isAdmin: true` to a user profile.
3. **Orphaned Quiz**: Create a quiz for a `documentId` that doesn't exist.
4. **Score Tampering**: Update a progress record to increase the `score`.
5. **Path Poisoning**: Create a document with ID `../../etc/passwd`.
6. **Cross-User Leak**: Authenticated User A tries to `get` Document B owned by User B.
7. **Recursive Listing**: Attempt to `list` all documents without a `where` clause matching `userId`.
8. **Bulk Deletion**: Attempt to `delete` all documents.
9. **Terminal State Break**: Modify a document's analysis after it's been finalized.
10. **Resource Exhaustion**: Send a 2MB string as a document title.
11. **Timestamp Forgery**: Provide a client-side `createdAt` date from the past.
12. **PII Scraping**: Attempting to list all `users` to find email addresses.

## Test Runner (Logic Check)
- `users/{userId}`: `allow read, write: if isOwner(userId)`
- `documents/{docId}`: `allow create: if isOwner(incoming().userId) && isValidDoc(incoming())`
- `documents/{docId}`: `allow update: if isOwner(existing().userId) && isValidDoc(incoming()) && incoming().diff(existing()).affectedKeys().hasOnly(['title', 'analysis'])`
- `quizzes/{quizId}`: `allow create: if isOwner(incoming().userId) && exists(/documents/$(incoming().documentId))`
