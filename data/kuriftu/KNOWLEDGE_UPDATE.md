# Kuriftu Knowledge Update Pack

Use this file when updating Kuriftu AI behavior and answers.

## Source Files

- Primary KB: `data/kuriftu/knowledge.txt`
- Full profile: `data/kuriftu/FULL_PROFILE.md`
- Services: `data/kuriftu/services.txt`
- Rooms: `data/kuriftu/rooms.txt`

## Update Rules

1. Keep facts current and concrete (prices, hours, policies, transport, amenities).
2. Use consistent item naming between knowledge, services, and rooms.
3. Include exact booking terms where possible:
   - check-in/check-out times
   - cancellation window
   - transfer rules
   - occupancy limits
4. Prefer concise operational facts over marketing language.

## Suggested Monthly Update Checklist

1. Verify room prices and availability assumptions.
2. Verify service availability and hours.
3. Update seasonal offers/events.
4. Update transfer and contact details.
5. Re-upload `knowledge.txt` in panel and confirm ingestion is `Ready`.

## Knowledge Snippet Template

Use this section format inside `knowledge.txt` when adding new content:

```txt
## <Topic Name>
- Operational detail 1
- Operational detail 2
- Constraints and exceptions
- Guest-facing recommendation
```

## Booking Confirmation Quality Rule

Ensure the assistant always returns:

- item booked
- date/time
- confirmation code
- any next step for guest

This is required for automatic UI booking sync in the embed script.

