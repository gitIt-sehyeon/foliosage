# FolioSage Demo Data

This folder contains a production-safe demo seed for screenshot and judging flows.

## Demo Login

- Email: `jaydenjeongdev@gmail.com`
- Password: `FolioSage2026!`
- Public portfolio: `/p/FS-DEMO-2026`
- Backend portfolio: `/p/FS-BACKEND-2026`
- Public profile: `/u/jaydenjeong`

## Apply To Production

From the deploy host:

```bash
./scripts/seed-demo-data.sh
```

Or with a direct database URL:

```bash
DATABASE_URL='postgresql://user:password@host:5432/foliosage' ./scripts/seed-demo-data.sh
```

The SQL is idempotent. Running it again updates the same demo account, portfolio, files, story, readiness prerequisites, public link, stats, certificates, and AI review records.

## Notes

The seed creates metadata-only file records with realistic VaultSage ids. Admin/public portfolio screens, story, organizer, readiness, stats, certificates, and AI review panels will be populated.

File preview and raw downloads require the seeded `vaultsage_file_id` values to exist in the production VaultSage account. If you need live previews for screenshots, upload matching real files through the app after applying the seed, or replace the `vaultsage_file_id` values in `demo_seed.sql` with real production VaultSage file ids.
