Docs Audit & Archive - Imperium Gate

Date: 2025-11-19

Purpose: this file records a non-destructive audit of the `docs/` folder. It lists which files are current/authoritative and suggests which files to archive or remove. No files have been deleted yet — this is a proposal. After you (the owner) confirm, I will perform the archival/move operations.

Active / Keep (recommended):
- `APPLICATION_STATUS.md`  — status and live notes
- `SETUP_COMPLETE.md` — environment and setup verification
- `PHASE1_FIXES_GUIDE.md` — important fixes instructions
- `PHASE2_2_AI_SUGGESTIONS.md` — AI feature documentation
- `TESTING_GUIDE.md` — test instructions
- `UPDATES.md` — change log
- `HOW_TO_CREATE_USER.md` — onboarding steps
- `CREDENTIALS.md` — *sensitive* keep locked and rotate if exposed
- `README.md` and `README-AR.md` — primary documentation

Candidates to Archive (suggested):
- `PHASE1_README.md` — likely duplicate of Phase1 docs
- `PHASE1_COMPLETION_REPORT.md` — snapshot; can be archived for history
- `PHASE1_STATUS_REPORT.md` — snapshot; archive
- `FINAL_SUMMARY.txt` — historical; archive
- `PHASE1_COMPLETION_REPORT.md` — (duplicate listing) archive

Files to Review (owner decision):
- `DOCUMENTATION.md` (if exists) — check for duplication
- Any `*_OLD.md` or `*_DRAFT.md` files — archive or merge content

Archive Plan (what I will do after confirmation):
1. Copy selected files into `docs/ARCHIVE/` preserving names and content.
2. Remove original files from `docs/` folder.
3. Update `docs/ARCHIVE/README.md` with the list of moved files and dates.
4. Update `APPLICATION_STATUS.md` and `UPDATES.md` to reference the archived snapshots.

Security note:
- `CREDENTIALS.md` may contain secrets — rotate keys if these were committed or shared.

Please confirm which files you want archived/deleted, or reply `archive all candidates` to proceed with the proposed list.
