# Database

Database schemas, migrations, and seed data for the Rose of Sharon Management System.

## Status

Not yet implemented. This folder is reserved for:

- Database schema files (DDL)
- Migration scripts
- Seed data
- Entity relationship diagrams (ERDs)

## Planned Structure

```
database/
├── migrations/     Ordered SQL migration files
├── seeds/          Seed data for development
├── schema/         Full schema dump / ERD
└── README.md
```

## Planned Schema

Core tables:
- `members`, `e_members`
- `first_timers`, `second_timers`, `new_converts`
- `messages`, `communication_templates`
- `requests`
- `celebrations`
- `training_courses`, `training_enrollments`
- `events`, `event_registrations`
- `roles`, `permissions`, `user_roles`
- `groups`, `group_members`
- `notifications`
