# VimGym

[![Netlify Status](https://api.netlify.com/api/v1/badges/f74dacba-e3b4-4781-8c47-323e153b644f/deploy-status)](https://app.netlify.com/projects/vim-gym/deploys)

This was built using:

Vite, Tanstack Start, Tailwind CSS, Motion.dev, Codemirror and CodeMirror-Vim.

It was built using Neovim and sometimes Antigravity. The LLMs used were Gemini 3.5 Pro and Opus, they were mainly deployed to port vimsplain.py to Typescript and in testing.

To do:

- [x] Some sort of token parsing so the motion log can group and show the actual motion (all the libs I've found related to this seem abandoned)
- [x] For each level, also store the perfect answer - so a user can compare how far they are off optimum (level selector could represent this per level)
- [x] Analytics (using vexo) to record level score events to crowd-source optimum scores. Payload `{ level, score, keystrokes }`
- [x] Don't just record the perfectScore as a number, but also the keystrokes and surface these to the user if they want to see them
- [ ] Consider publishing vimsplain.ts as a package
- [ ] Consider how we can improve Codemirror vim to support text objects
- [ ] Perhaps a sense of medals based on how far you are off optimum
- [ ] Theme picker
- [ ] Crowd source submissions for levels?
