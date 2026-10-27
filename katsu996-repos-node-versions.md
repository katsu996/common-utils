# katsu996 リポジトリ横断: Node/パッケージバージョン管理状況

全 68 リポジトリを GitHub API で走査。ルート直下に `.node-version` / `.nvmrc` / `mise.toml` のいずれかがある 26 リポジトリを対象に、`package.json` の `engines` / `devEngines` / `packageManager` も併記。

- `.nvmrc` 該当なし
- common-utils / FlareLobby / md2html は `.node-version` と `mise.toml` を二重管理

## バージョンファイル保有リポジトリ（26件）

| リポジトリ | .node-version | .nvmrc | mise.toml | package.json engines | package.json devEngines | package.json packageManager |
|---|---|---|---|---|---|---|
| BMS | - | - | [tools] python = "3.13.14" | - | - | - |
| FlareLobby | 24.19.0 | - | [tools] node = "24.19.0" pnpm = "11.21.0" | {"node":">=22"} | {"runtime":{"name":"node","version":">=24.19.0","onFail":"download"}} | pnpm@11.21.0 |
| Gunslinger | - | - | [tools] node = "24.16.0" pnpm = "10.33.4" rust = "1.88.0" | - | - | pnpm@10.33.4 |
| HighSpeedFPS | 24.20.0 | - | - | {"node":"24.20.x","pnpm":"11.24.0"} | - | pnpm@11.24.0 |
| JanCame | - | - | [tools] node = "24.16.0" pnpm = "10.34.1" | - | - | pnpm@10.34.1 |
| KatsuFastAPI | - | - | [tools] python = "3.12.9" [settings] python.uv_venv_auto = true | - | - | - |
| OnlineGame | 18.13.0 | - | - | - | - | - |
| SalonAdvisor | - | - | [tools] node = "24.18.0" pnpm = "11.28.5" | - | {"runtime":{"name":"node","version":"24.18.0","onFail":"download"}} | pnpm@11.28.5 |
| Samurai-Kirby | - | - | [tools] node = "22.16.0" pnpm = "10.16.0" | {"node":">=22.16.0","pnpm":">=10.16.0"} | - | pnpm@10.16.0 |
| X-Memos | - | - | [tools] node = "24.16.0" pnpm = "10.33.4" | - | - | pnpm@10.33.4 |
| clasp | - | - | [tools] node = "24.19.0" pnpm = "11.21.0" | {"node":">=24.19.0"} | - | pnpm@11.21.0 |
| cloudflare-board | - | - | [tools] bun = "1.4.0" node = "24.19.0" | - | {"runtime":{"name":"node","version":">=24.18.0","onFail":"download"}} | bun@1.4.0 |
| cloudflare-digest | - | - | [tools] bun = "1.4.0" node = "24.19.0" | - | {"runtime":{"name":"node","version":">=24.18.0","onFail":"download"}} | bun@1.4.0 |
| cloudflare-go-chi | - | - | [tools] node = "24.19.0" pnpm = "11.21.0" | - | - | pnpm@11.21.0 |
| cloudflare-python-fastapi | - | - | [tools] python = "3.14.8" | - | - | - |
| cloudflare-rust | - | - | [tools] node = "24.19.0" pnpm = "11.21.0" | - | {"runtime":{"name":"node","version":">=24.19.0","onFail":"download"}} | pnpm@11.21.0 |
| cloudflare-typescript-hono | - | - | [tools] bun = "1.4.3" node = "24.18.0" | - | {"runtime":{"name":"node","version":">=24.18.0","onFail":"download"}} | bun@1.4.3 |
| cloudflare-website-cms | - | - | [tools] bun = "1.4.0" node = "24.18.0" | - | {"runtime":{"name":"node","version":">=24.18.0","onFail":"download"}} | bun@1.4.0 |
| common-utils | 24.19.0 | - | [tools] node = "24.19.0" pnpm = "11.21.0" | {"node":">=22"} | {"runtime":{"name":"node","version":">=24.19.0","onFail":"download"}} | pnpm@11.21.0 |
| katsu | - | - | [tools] bun = "1.4.0" node = "24.19.0" | - | {"runtime":{"name":"node","version":">=24.19.0","onFail":"download"}} | bun@1.4.0 |
| md2html | 24.19.0 | - | [tools] node = "24.19.0" pnpm = "11.21.0" | {"node":">=22"} | {"runtime":{"name":"node","version":">=24.19.0","onFail":"download"}} | pnpm@11.21.0 |
| tempane | 24.14.0 | - | - | {"node":">=24.0.0"} | - | pnpm@11.7.0 |
| tmux-ai | - | - | [tools] node = "20.18.2" pnpm = "10.12.1" | - | - | - |
| video-recorder | - | - | [tools] node = "24.18.0" pnpm = "11.28.0" | {"node":"24.18.0"} | - | pnpm@11.28.0 |
| wxt-sf6 | - | - | [tools] node = "20.18.2" pnpm = "10.12.1" | {"npm":"use pnpm","yarn":"use pnpm"} | - | - |
| ytdl | - | - | [tools] node = "24.19.0" pnpm = "11.21.0" | - | - | pnpm@11.22.0+sha512.1ff870c4c6133dfd88fb2afc46dd13d47f09c9794b438c6fdb47ca98caf3bc16381ee0be93a091b8e3824cf01f889f46d7d9e20910fb0be1ab0fb5baa80dd621 |

## バージョンファイルなしで package.json に記載があるリポジトリ（7件）

| リポジトリ | package.json engines | package.json devEngines | package.json packageManager |
|---|---|---|---|
| StoneColoring | {"node":">=24"} | - | pnpm@10.34.5 |
| Discord-SpotJobs | {"node":">=24"} | - | bun@1.4.2 |
| memo | {"node":">=22"} | - | pnpm@10.33.3 |
| test_VitePress | - | - | bun@1.3.6 |
| old_nextjs | {"npm":"use yarn"} | - | - |
| OnlineGame-Backend | {"node":">=14"} | - | - |
| RatingMonitorDiscord | {"node":"16.x"} | - | - |
