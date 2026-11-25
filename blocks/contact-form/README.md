# contact-form

Custom **custom** block. Purpose: Intro text beside a contact form with labelled fields and a submit button.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1 = intro (heading, text, email link); then one row per field as 'Label | type | required' (types: text, email, tel, url, number, textarea, select, checkbox; for select put the choices in cell 3); a 'Button label | submit' row; optional config rows 'action | endpoint URL' (POST JSON), 'success | message', 'error | message'. Without an action row nothing is sent.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
