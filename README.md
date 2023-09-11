# bingle
a CLI tool written in pure JavaScript that takes in any `.bin` file taken from any "web-based" game by Google, and extracts all the audio files contained within it, according to the index.

# usage
run the program with the `-h` option to see the program usage.

# quickstart
```console
$ git clone https://github.com/wulliy/bingle.git
$ cd bingle
$ node bingle.js -h
```

# example
```console
$ node bingle.js -i ./bin/minesweeper/music_audio.bin -w 385 -x LOSE_MUSIC 2 -x WIN_WATER_HARP 1456 -x WINNER_MUSIC 2826
```

this example takes in a `music_audio.bin` file taken from [Google Minesweeper](https://www.google.com/fbx?fbx=minesweeper), and extracts 3 audio files from it.

the resulting files are `LOSE_MUSIC.mp3`, `WIN_WATER_HARP.mp3`, and `WINNER_MUSIC.mp3`.

# license
this project is licensed under the [MIT License](https://choosealicense.com/licenses/mit).

# Q&A
### what counts as a "web-based" game by Google?
any game that uses web technologies, is hosted somewhere online, and was/is maintained/developed by Google counts as a "web-based" game.
a couple examples of this are [Google Snake](https://www.google.com/fbx?fbx=snake_arcade), [Google Minesweeper](https://www.google.com/fbx?fbx=minesweeper), and so on.

### how do i obtain a `.bin` file?
there are many different ways, but the easiest way should be to follow the steps below:
1. open your browser's DevTools and check the Network tab
2. make sure it's recording any and all network activity
3. visit a web-based game by Google
	- if you're already on one, just refresh the page
4. look for any `GET` requests that fetch a `.bin` file
5. download the file from its URL

### i'm not seeing any `.bin` files...
make sure you're recording network activity first before inspecting any requests for `.bin` files.

if you've already tried this and still don't see any, then the game probably doesn't use `.bin` files for storing its audio. in that case, you don't need to use this tool, but to instead look for any `.mp3` or `.ogg` files and to download either one of those (or both if you want, but it really doesn't matter).