<div align="center">

# [timmoc.dev](https://timmoc.dev)

</div>

## 📖 What is this?

A [What The Commit](https://whatthecommit.com/) clone built as a Cloudflare Worker. It returns random commit messages for those times when you just need to ship code and don't want to think about commit messages. I started this project when [commitment](https://github.com/ngerakines/commitment) and [whatthecommit](https://whatthecommit.com) were down.

---

## 🚀 How to use

| Endpoint | Description                              | Try it                           | Response            |
| -------- | ---------------------------------------- | -------------------------------- | ------------------- |
| `/`      | Returns a random commit message in plain text | [timmoc.dev](https://timmoc.dev) | `Wubbalubbadubdub!` |

#### For a list of quotes, see [quotes.ts](https://github.com/claughinghouse/timmoc/blob/main/src/quotes.ts)

I have an alias in my [.gitconfig](https://github.com/claughinghouse/dotfiles/blob/main/dot_gitconfig#L12) that allows me to run `git yolo` and it will commit with a random commit message from this repo. If I feel really adventurous, I can run `git yeet` and it will add all the files, commit them, and push.

You can add this git alias and be up and running quickly.

```bash
git config --global alias.timmoc '!git commit -m "$(curl -s https://timmoc.dev)"'
```

Then just run `git timmoc` to add a random commit message to your staged changes.

## But why?

Since most of my projects are solo ventures, I dislike spending time and creative juices creating commit messages that I may never see again. I would rather `git yeet` my changes and iterate rapidly.

## 🫶 Contributing

Want to see your commit message added to the list? Submit a PR with your commit message added to the [quotes.ts](https://github.dev/claughinghouse/timmoc/blob/main/src/quotes.ts) file. If you want to add a new feature, please open an issue first.

## 🤝 Gratitude and Thanks

Thanks to [Nick Gerakines](https://github.com/ngerakines) for creating [commitment](https://github.com/ngerakines/commitment) and the original [whatthecommit](https://whatthecommit.com) that inspired this project.
