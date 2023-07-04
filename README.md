<div align="center">

# [timmoc.dev](https://timmoc.dev)

## Deploy Status

[![Seed Status](https://api.seed.run/timmoc/timmoc/stages/dev/build_badge)](https://console.seed.run/timmoc/timmoc)&nbsp;&nbsp;&nbsp;
[![Seed Status](https://api.seed.run/timmoc/timmoc/stages/prod/build_badge)](https://console.seed.run/timmoc/timmoc)

</div>

---

## 📖 What is this?

This monorepo contains all the code necessary to stand up a [What The Commit](https://whatthecommit.com/) clone. It is built using [Serverless Stack](https://serverless-stack.com/) and deployed with [Seed](https://seed.run/). I started this project to learn more about the [SST API](https://docs.sst.dev/constructs/Api) construct when [commitment](https://github.com/ngerakines/commitment) and [whatthecommit](https://whatthecommit.com) was down.

---

## 🚀 How to use

| Endopoint    | Description                                                                                                                                    | Try it                                                                                                              | Response                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/`          | Returns a random commit message in txt form.                                                                                                   | [timmoc.dev](https://timmoc.dev)                                                                                    | `Wubbalubbadubdub!`                                                                                                   |
| `/{id}`      | Returns the commit message for the `{id}`. The `{id}` is the sha256 hash of the actual commit message.                                         | [timmoc.dev/636f571...c357bdf](https://timmoc.dev/636f571729431658f6454ae604398163a1bbb6ae527dc723b03cc0ab8c357bdf) | `Wubbalubbadubdub!`                                                                                                   |
| `/json`      | Returns a random commit message in json form. The key is a sha256 sum of the message.                                                          | [timmoc.dev/json](https://timmoc.dev/json)                                                                          | `{"636f571...c357bdf":"Wubbalubbadubdub!"}`                                                                           |
| `/json/{id}` | Returns the commit message in json format, including the `id`, `quote`, and a `json_permalink`. The example response is shortened for brevity. | [timmoc.dev/{id}](https://timmoc.dev/json/636f571729431658f6454ae604398163a1bbb6ae527dc723b03cc0ab8c357bdf)         | `{"id":"636f571...c357bdf","quote":"Wubbalubbadubdub!","json_permalink":"https://timmoc.dev/json/636f571...c357bdf"}` |

#### For a list of quotes, see [quotes.txt](https://github.com/claughinghouse/timmoc/blob/main/packages/core/lib/quotes.txt) or the [hashedQuotes json version](https://github.com/claughinghouse/timmoc/blob/main/packages/core/src/hashedQuotes.json)

I have an alias in my [.gitconfig](https://github.com/claughinghouse/dotfiles/blob/main/dot_gitconfig#L12) that allows me to run `git yolo` and it will commit with a random commit message from this repo. If I feel really adventurous, I can run `git yeet` and it will add all the files, commit them, and push.

You can add this git alias and be up and running quickly.

```bash
git config --global alias.timmoc '!git commit -m "$(curl -s https://timmoc.dev)"'
```

Then just run `git timmoc` to add a random commit message to your staged changes.

## But why?

Since most of my projects are solo ventures, I dislike spending time and creative juices creating commit messages that I may never see again. I would rather `git yeet` my changes and see them reflected on my [development SST stage](https://docs.sst.dev/constructs/Stack#stage) so I can iterate rapidly. Inspiration to care a little less about personal project commit messages came from this [Pieter Levels tweet](https://twitter.com/levelsio/status/1590908364393156608.)

## 🫶 Contributing

Want to see your commit message added to the list? Submit a PR with your commit message added to the [quotes.txt](https://github.dev/claughinghouse/timmoc/blob/main/packages/core/lib/quotes.txt) file. If you want to add a new feature, please open an issue first.

## 🛣️ Roadmap

Github issues are used to track the roadmap. See [Roadmap](https://github.com/claughinghouse/timmoc/labels/roadmap).

## 🤝 Gratitude and Thanks

Thanks to all the people who donate their time to the [SST Discord community](https://discord.gg/sst) and the [SST Project](https://sst.dev/). Much of the code in this repo is based on the work of the SST community, [commitment](https://github.com/ngerakines/commitment), and [Nick Gerakines's](https://github.com/ngerakines) awesome work.

## 📜 Changelog

See my _awful_ [commit history](https://github.com/claughinghouse/timmoc/commits/main)

## 🔏 License

See [LICENSE](./LICENSE)
