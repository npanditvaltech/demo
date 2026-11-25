# Site Migration Plan: npanditvaltech.github.io/eds

## Status
**Waiting for Execute mode.** This chat is still in plan mode, which only lets me read files. I can't scan the site, write code or import pages until you switch it to **Execute mode**. Once you switch and send "Start the migration" again, I'll begin the site scan straight away. No more questions are needed: everything below is already decided, so the run goes from start to finish on its own.

## Overview
Move the whole site at **https://npanditvaltech.github.io/eds/** to AEM Edge Delivery Services, one page template at a time. The project is already linked to Document Authoring (org `npanditvaltech`, site `demo`). The site hasn't been scanned yet, so the scan comes first.

## Decisions (confirmed)
- **Site scan:** scan the site first (find its pages, group them into templates, list their blocks), then migrate.
- **Scope:** all pages. Any template whose pages couldn't be analyzed is left out and named in the summary.
- **Block library:** build any blocks and block variants the site needs that the project doesn't have yet.
- **Defaults I'll choose for you:**
  - Header and footer are migrated from the source site.
  - Content that's identical across pages becomes a reusable fragment.
  - A step that fails is retried once. If it fails again, I record the reason and move on.
- **Changes stay local.** Nothing is uploaded to Document Authoring, previewed or published unless you ask for it separately.

## Phases
1. **Site scan:** find every URL, analyze the pages, group them into templates, and catalog the blocks, variants, header and footer.
2. **Catalog check:** confirm which templates have usable pages, then record the migration plan with the decisions above.
3. **Project setup and block library:** confirm the project type and build the missing blocks and variants.
4. **First template** (the one with the most block variants):
   - Map its blocks and sections.
   - Generate the import code (parsers, transformers and the import script).
   - Import a small pilot set of pages and check them against the source.
5. **Header and footer:** migrate the site navigation and footer for desktop and mobile.
6. **Site design:** capture the source styles (colors, fonts, spacing, how each block looks) and apply them across the site.
7. **Remaining content:** import and validate the rest of the first template's pages. Then repeat mapping, import code, pilot, import and validation for each other template.
8. **Review:** compare a sample of migrated pages with the original site and fix shared code once.
9. **Summary:** report pages imported, validation scores, decisions made, gaps left open or waived, and any failures.

## Checklist
- [ ] Switch this chat to Execute mode and send "Start the migration"
- [ ] Scan https://npanditvaltech.github.io/eds/ (find URLs, group them into templates, catalog blocks)
- [ ] Check the catalog and record which templates are ready
- [ ] Create the migration plan (scope: all pages; build missing blocks)
- [ ] Project setup: confirm the project type
- [ ] Block library: build the missing blocks and variants
- [ ] First template: map blocks and sections
- [ ] First template: generate import parsers and transformers
- [ ] First template: generate the import script
- [ ] First template: import pilot pages and check them against the source
- [ ] Migrate the header (navigation, desktop and mobile)
- [ ] Migrate the footer
- [ ] Site design: capture source styles and apply them to the site and every block
- [ ] First template: import the remaining pages
- [ ] First template: validate the imported pages and fix failures
- [ ] Each remaining template: mapping → import code → pilot → import → validation
- [ ] Review a sample of pages against the original site and fix differences
- [ ] Migration summary: results, scores, decisions and open items

## Notes
- All changes are made locally, and you can check them in the preview as they come in. Uploading to Document Authoring or publishing is a separate step you'd need to ask for.
- How long the run takes depends on how many pages and templates the scan finds. The scan report gives a page count for each template.
