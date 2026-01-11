# Issues Found and Fixes Applied

## Issue 1: Profile Save Not Working

### Problem
When trying to save profile changes in the Profile page, the request failed with a validation error.

### Root Cause
The `UserRequest` DTO used for profile updates has `@NotBlank` validation on the password field:

```java
// UserRequest.java
@NotBlank(message = "Password is required")
@Size(min = 8, message = "Password must be at least 8 characters")
String password
```

This meant the password was **required** for all updates, but when editing a profile, users typically only want to update name/email/phone without changing their password.

### Fix
Created a new `ProfileUpdateRequest` DTO without required password:

**File:** `src/main/java/com/myapp/reservations/DTO/UserDTOs/ProfileUpdateRequest.java`
```java
public record ProfileUpdateRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    String phone,
    @Size(min = 8) String password  // Optional - only validate if provided
) {}
```

**File:** `UserService.java` - Added new method:
```java
public UserResponse updateProfile(UUID id, ProfileUpdateRequest request) {
    // Only update password if provided and not blank
    if (request.password() != null && !request.password().isBlank()) {
        existing.setPassword(passwordEncoder.encode(request.password()));
    }
}
```

**File:** `UserSelfController.java` - Updated to use new DTO:
```java
@PutMapping
public void updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
    userService.updateProfile(currentUserId, request);
}
```

---

## Issue 2: Default Schedule Not Saved When Creating Business

### Problem
When creating a new business, the default schedule settings were created but not saved to the database.

### Root Cause
In `ScheduleService.createDefaultSchedule()`, the method sets:
```java
settings.setBusiness(business);  // Links ScheduleSettings -> Business
```

But it **never** sets:
```java
business.setScheduleSettings(settings);  // Links Business -> ScheduleSettings
```

Since the Business entity has `cascade = CascadeType.ALL` on the `scheduleSettings` relationship, JPA only cascades saves when the parent (Business) knows about the child. Without the back-reference, the ScheduleSettings object was created in memory but never persisted.

### Fix
**File:** `src/main/java/com/myapp/reservations/Services/ScheduleService.java`

Added the missing line at the end of `createDefaultSchedule()`:
```java
settings.setWorkingDays(days);

// CRITICAL: Link the ScheduleSettings to the Business for cascade persistence
business.setScheduleSettings(settings);
```

Now when `businessRepository.save(business)` is called, the ScheduleSettings and all WorkingDays are automatically persisted via cascade.

---

## Issue 3: Dashboard Only Supports Single Business

### Problem
The Dashboard page only showed one business and didn't allow users to manage multiple businesses.

### Fix
**File:** `fe/src/pages/Dashboard.tsx`

1. Added a **business selector dropdown** in the header when user has multiple businesses
2. Kept the **"Add Business" button** always visible to create more businesses
3. When selecting a different business, the page loads that business's offerings, schedule, and settings

---

## Issue 4: Schedule Tab Not Implemented

### Problem
The Schedule tab in the Dashboard showed "Coming soon..."

### Fix
**File:** `fe/src/pages/Dashboard.tsx`

Implemented full schedule management with:
- **Booking settings**: Min/max advance booking time, auto-confirm toggle
- **Working hours**: For each day of the week, toggle open/closed and set hours
- **Save button**: Calls `PUT /api/schedules/business/{id}` to persist changes

---

## Issue 5: Settings Tab Not Implemented

### Problem
The Settings tab in the Dashboard showed "Coming soon..."

### Fix
**File:** `fe/src/pages/Dashboard.tsx`

Implemented business settings form with:
- Business name, description, address, phone fields
- Save button that calls `PUT /api/businesses/update/{id}`
- Auto-updates the business list and selector after save

---

## Issue 6: Frontend Types Didn't Match Backend

### Problem
The frontend TypeScript types for `ScheduleSettings` and `WorkingDay` didn't include all the fields from the backend.

### Fix
**File:** `fe/src/lib/types.ts`

Updated types to include:
- `ReservationType`: 'SLOT' | 'RANGE'
- `ChronoUnit`: 'MINUTES' | 'HOURS' | 'DAYS'
- `WorkingDayRequest.dayOfWeek`: Changed from number to string (e.g., "MONDAY")
- `WorkingDay.breakStartTime/breakEndTime`: Added optional break fields
- `ScheduleSettings`: Added all booking configuration fields

---

## Summary of Files Changed

### Backend
| File | Change |
|------|--------|
| `DTO/UserDTOs/ProfileUpdateRequest.java` | NEW - Profile update DTO without required password |
| `Services/UserService.java` | Added `updateProfile()` method |
| `Controller/UserSelfController.java` | Updated to use `ProfileUpdateRequest` |
| `Services/ScheduleService.java` | Fixed `createDefaultSchedule()` to link business |
| `DTO/ReservationDTOs/ReservationResponse.java` | Added `businessName` field |
| `Mappers/ReservationMapper.java` | Map business name in response |

### Frontend
| File | Change |
|------|--------|
| `pages/Dashboard.tsx` | Complete rewrite with multi-business support, schedule & settings tabs |
| `pages/Profile.tsx` | NEW - User profile page |
| `pages/MyReservations.tsx` | NEW - User reservations page |
| `lib/types.ts` | Updated schedule types, added `businessName` to Reservation |
| `lib/api.ts` | Added `userApi`, updated type imports |
| `App.tsx` | Added routes for `/auth/profile` and `/reservations` |

---

---

## Issue 7: Profile Update Breaks All Authenticated Operations

### Problem
After changing name or email in the Profile page, all subsequent API requests failed with "User not found". The user had to log out and log back in.

### Root Cause
The authentication system had multiple interconnected issues:

1. **JWT Token**: Stored only the `username` as the subject
2. **getCurrentUserId()**: Used `findByName(auth.getName())` to look up user
3. **AuthTokenFilter**: Used `loadUserByUsername()` to authenticate

When the user changed their name:
- JWT still contained the OLD name
- `findByName(oldName)` returned null → "User not found"
- All authenticated operations failed (profile, reservations, etc.)

### Fix - Multi-part Solution

**1. Updated JwtUtil to store userId in JWT claims:**
```java
public String generateToken(String username, UUID userId){
    return Jwts.builder()
            .subject(username)
            .claim("userId", userId.toString())  // NEW: Store userId
            .issuedAt(new Date())
            .signWith(key)
            .compact();
}

public UUID getUserIdFromToken(String token){
    Claims claims = Jwts.parser()...parseSignedClaims(token).getPayload();
    String userIdStr = claims.get("userId", String.class);
    return userIdStr != null ? UUID.fromString(userIdStr) : null;
}
```

**2. Updated AuthenticationController to include userId when generating token:**
```java
String token = jwtUtils.generateToken(userDetails.getUsername(), authenticatedUser.getId());
```

**3. Updated AuthTokenFilter to prefer userId over username:**
```java
final UUID userId = jwtUtil.getUserIdFromToken(jwt);
if (userId != null) {
    userDetails = customUserDetailsService.loadUserById(userId);
    request.setAttribute(USER_ID_ATTRIBUTE, userId);
} else {
    // Fallback for old tokens
    userDetails = customUserDetailsService.loadUserByUsername(username);
}
```

**4. Added loadUserById to CustomUserDetailsService:**
```java
public UserDetails loadUserById(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return new User(user.getName(), user.getPassword(), Collections.emptyList());
}
```

**5. Updated getCurrentUserId() to get userId from request attribute:**
```java
public UUID getCurrentUserId() {
    ServletRequestAttributes requestAttributes =
        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (requestAttributes != null) {
        UUID userId = (UUID) request.getAttribute(AuthTokenFilter.USER_ID_ATTRIBUTE);
        if (userId != null) return userId;
    }
    // Fallback for old tokens...
}
```

**6. Added updateUser to AuthContext and Profile page:**
```typescript
// AuthContext
const updateUser = (userData: Partial<User>) => {
  if (user) {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }
};
```

### Files Changed
- `security/JwtUtil.java` - Added userId claim and extraction
- `security/AuthTokenFilter.java` - Use userId for authentication
- `Services/CustomUserDetailsService.java` - Added loadUserById()
- `Services/UserService.java` - Updated getCurrentUserId()
- `Controller/AuthenticationController.java` - Pass userId to generateToken
- `fe/src/contexts/AuthContext.tsx` - Added updateUser method
- `fe/src/pages/Profile.tsx` - Call updateUser after save

---

## Testing Checklist

1. [ ] Create a new user and verify profile page works
2. [ ] Edit profile (name, email, phone) and save - should succeed
3. [ ] **After profile save, verify other features still work (reservations, dashboard)**
4. [ ] Create a new business - should create with default schedule
5. [ ] Check Schedule tab - should show default working hours (Mon-Fri 9-5)
6. [ ] Modify schedule and save - should persist changes
7. [ ] Create a second business - should appear in dropdown
8. [ ] Switch between businesses - should load correct data
9. [ ] Edit business settings and save - should update
10. [ ] Make a reservation - should show business name in My Reservations
11. [ ] **Important: After name change, create a reservation - should work**
