# ThaiPDFEditor

ThaiPDFEditor is a local-first web app for basic PDF work. Files are processed in the browser and are not uploaded to an application server.

## Included tools

- Merge PDF
- Split PDF
- Extract pages
- Remove pages
- Organize PDF
- Rotate PDF
- Add page numbers
- Add watermark
- JPG to PDF
- PDF to JPG

## Not included in this build

These are intentionally left disabled because they need more engine coverage than this static local-first build currently has:

- Compress PDF
- OCR PDF
- Protect PDF
- Unlock PDF

## Run locally

Because this project is a static app, you can serve it with any simple HTTP server:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

## Stack

- Vanilla HTML, CSS, JavaScript
- [pdf-lib](https://pdf-lib.js.org/)
- [PDF.js](https://mozilla.github.io/pdf.js/)

## Privacy model

- No account system
- No PDF storage in the app
- Browser-only processing for enabled tools
