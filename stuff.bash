# in the repo root
git status        # sanity check
git add -A
git commit -m "Initial commit"
# (If Git asks for your name/email)
git config --global user.name
git config --global user.email
git commit -m "Initial commit"
# add/push to a remote
git remote add origin <git-url>
git branch -M main
git push -u origin main