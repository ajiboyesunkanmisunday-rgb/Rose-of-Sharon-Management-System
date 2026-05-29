# Backend Issues — QA Findings

> Compiled from QA testing on the ROSMS frontend.  
> All issues below require backend changes. Frontend workarounds are noted where they exist.

---

## 1. QR Code Uploads Fail (413 / Upload Error)

**Affects:** Members, E-Members  
**Symptom:** Uploading a QR code image fails with a 413 error or a generic upload error message.  
**Root cause:** The Spring Boot multipart upload size limit is too low to accept image uploads from the QR code form.  
**Fix:** Increase the upload size limits in `application.properties` (or `application.yml`):

```properties
spring.servlet.multipart.max-file-size=200MB
spring.servlet.multipart.max-request-size=200MB
```

This is the same fix required for media uploads elsewhere in the system.

---

## 2. New Convert — Call and Visit Reports Not Supported

**Affects:** New Converts view page → Activity tab  
**Symptom:** When a user tries to save a call or visit report for a New Convert, the backend returns an error. The frontend displays: *"Call/Visit reports are not yet available on the server. Please contact your administrator."*  
**Root cause:** The `/api/v1/notes/call` and `/api/v1/notes/visit` endpoints do not currently accept note entries associated with records in the `new_converts` table.  
**Fix:** Extend the notes endpoints to support `new_converts` table entries. The frontend sends a standard `userId` (the new convert's UUID) in the request body — the backend needs to accept and persist notes for that entity type.

---

## 3. E-Member QR Code Form — Cannot Select Service Attended or Groups, Cannot Save

**Affects:** E-Members → QR Code registration form  
**Symptom:** When filling out the QR code form for an E-Member, the dropdowns for "Service Attended" and "Groups" do not work correctly. Saving the form also fails.  
**Root cause:** Likely the QR registration endpoint (`/api/v1/e-members/{id}/qr-registration` or equivalent) is either not implemented, not reachable, or returns an error when the payload includes service/group fields.  
**Fix:**
- Verify the QR registration endpoint exists and is mapped correctly.
- Ensure it accepts `serviceAttended` and `groups` fields in the request body.
- Return a proper success or validation error response.

---

## 4. Link Spouse — Server Error When Selecting an Existing Member

**Affects:** Members, E-Members → Link Spouse flow  
**Symptom:** When a user searches for and selects an existing member as a spouse, the action fails with: *"Server error. Please try again or contact support."*  
**Root cause:** The backend call to `/api/v1/users/{userId}/link-spouse/{spouseId}` fails. The exact cause is unknown from the frontend, but the server returns a 5xx error.  
**Fix:**
- Check the link-spouse endpoint for unhandled exceptions.
- Ensure the endpoint correctly handles linking between existing member records.
- Return a descriptive error if a constraint prevents linking (e.g., the spouse is already linked elsewhere).

---

## 5. Spouse Marital Status Conflict on Link Spouse

**Affects:** Members, E-Members → Link Spouse  
**Symptom:** Error: *"Marital status is SINGLE but a spouse is linked."* When the selected spouse's current `maritalStatus` is `SINGLE`, the backend rejects the link operation.  
**Root cause:** The backend enforces a constraint that the spouse's marital status must not be `SINGLE` before a spouse link is allowed.  
**Fix (choose one or both):**
- **Option A:** Remove the constraint. Allow the link to proceed regardless of the current marital status, since the act of linking implies the status should be updated.
- **Option B:** Automatically update the `maritalStatus` of both parties to `MARRIED` (or a configurable status) when a spouse link is created.
- At minimum, return a clear, actionable error message so the user knows to update the marital status first.

---

## 6. Follow-Up Assignment Not Reflected in Table

**Affects:** First Timers, Second Timers → Assign Follow-Up  
**Symptom:** After successfully calling the assign follow-up API, the assigned officer's name does not appear in the list table. The table still shows "Not assigned."  
**Root cause:** The `PUT /api/v1/users/{userId}/assign-followup/{followUpMemberId}` call may succeed (returns 200), but either:
- The response does not include the updated `assignedFollowUp` field, so the frontend cannot update the row; or
- The assignment is not being persisted correctly in the database.  
**Fix:**
- Ensure the endpoint persists the `assignedFollowUp` association correctly.
- Return the updated user/record in the response body so the frontend can reflect the change without requiring a full page reload.

---

## 7. Activity Log — Location Shows Wrong City (e.g., "dustin-ma, Nigeria")

**Affects:** Activity Log / Audit trail  
**Symptom:** User activity logs display an incorrect geographic location (e.g., "dustin-ma, Nigeria") instead of the actual user's location.  
**Root cause:** IP geolocation is resolving the wrong IP address. The backend is likely using the server's internal IP or a reverse proxy IP (Nginx) instead of the actual client IP.  
**Fix:**
- Configure the backend to read the `X-Forwarded-For` header (set by Nginx/load balancer) for the real client IP.
- Example in Spring Boot:

```java
String ip = request.getHeader("X-Forwarded-For");
if (ip == null || ip.isEmpty()) {
    ip = request.getRemoteAddr();
}
// Use 'ip' for geolocation lookup
```

- Also verify the geolocation data source is up to date and correctly resolving Nigerian IP ranges.

---

## 8. Request — Cannot Change Status (Permission Error)

**Affects:** Requests → View Request page → Change Status  
**Symptom:** When a user tries to change the status of a request, the action fails with a permission error, even for users who should have access.  
**Root cause:** The endpoint that handles status changes is gated behind a role or permission that the logged-in user does not have — or the permission check is incorrectly implemented.  
**Fix:**
- Review the roles/permissions required for the "change request status" endpoint.
- Ensure the correct roles (e.g., admin, department head) are mapped to this permission.
- If the permission configuration is correct, check for bugs in the authorization logic (e.g., role name mismatch, case sensitivity).

---

## 9. Request — Cannot Assign Request (Permission Error)

**Affects:** Requests → Assign Request  
**Symptom:** Error: *"You don't have permission to perform this action"* when attempting to assign a request to a staff member.  
**Root cause:** The assignment endpoint requires a role that the currently logged-in user does not hold. This may be an overly strict permission gate or a configuration oversight.  
**Fix:**
- Review which roles are permitted to call the assign-request endpoint.
- Confirm whether the role requirement matches the intended business rule (i.e., who should be allowed to assign requests).
- If the role is correct, check that role assignments in the database are accurate for the affected users.

---

*Last updated: 2026-05-29. Please update this file as issues are resolved.*
