# Publishing this repository to GitHub

1. Unzip `computational-intelligence-enterprise_v2.zip` and open a terminal in the extracted folder.
   Push the extracted files — do not upload the zip itself.
2. Set your real identity once (the old commit used a placeholder e-mail):
   ```bash
   git config --global user.name  "Srikanth Cherukupalli"
   git config --global user.email "you@your-domain.com"
   ```
3. Replace the old repository contents (this keeps the GitHub repository and its URL):
   ```bash
   git init
   git add .
   git commit -m "v2.0.0: rebuilt algorithms, exact baselines, benchmarks, tests and capstone"
   git branch -M main
   git remote add origin https://github.com/crsrikanth-07/computational-intelligence-enterprise.git
   git push --force -u origin main
   ```
   `--force` overwrites the old history (which contained only the zip). Omit it if you want to keep that history
   and merge instead.
4. Check that `LICENSE` is the MIT license the book refers to (the old repository root had an Apache license
   while the code said MIT; keep exactly one).
5. `.gitignore` keeps the built interior, cover and ebook images out of the repository. Keep it that way if you
   sell the book, and especially if the ebook is enrolled in KDP Select, which requires digital exclusivity.
