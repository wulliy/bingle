// wuilly
// 9/3/2023

// modules
const fs = require("fs")
const path = require("path")

// constants
const ARGS = process.argv.slice(2)
const FILE_NAME = process.argv[1].split("\\").pop()

const NAME = "bingle"
const VERSION = "1.0"
const INTRO = `${NAME} v${VERSION} - google audio file extractor thingamabob`
const HELP_MESSAGE = `usage: ${FILE_NAME} [-<option>] directory

options:
  -h              prints this help message and exits
  -s              silences any warnings that try to print

  -i path         sets the path to the input file
                  the path to this file usually ends in .bin

  -o path         sets the path to the output directory

  -w value        sets the "wa" value
  -x name value   adds a new entry into the index

notes:
  - there should be an entry in the index for each individual audio
    file contained in the .bin file.
`.trim()

const DEFAULT_WA = 418
const OPTION_REGEX = /^-+/g

// declarations
let config = {
	slient: false
}

let audio = {
	input: null,
	output: "./out",
	index: {},
	wa: DEFAULT_WA
}

const exit = process.exit
function error(...args) {
	console.log("ERROR:", ...args)
	process.exit()
}

function warn(...args) {
	if (config.slient) return
	console.log("WARNING:", ...args)
}

function check_output_dir(dir) {
	try {
		const exists = fs.existsSync(dir)
		if (!exists) {
			warn("output directory doesn\'t exist, creating directory")
			fs.mkdirSync(dir)
		}
	} catch(err) {
		error(`failed checking existance of output directory "${dir}": ${err}`)
	}
}

function parse_args(args) {
	let option = null
	let count = 0
	let values = []

	while (args.length > 0) {
		const arg = args.shift()
		if (arg.startsWith("-")) { // assume it's a option!
			option = arg.replace(OPTION_REGEX, "")
			count = 0
			values = []
		}

		count++
		values.push(arg)
		switch (option) {
			case "h": // help option
				console.log(HELP_MESSAGE)
				exit()

			case "s": // slient option
				config.slient = true
				break

			case "x": { // new entry option
				if (count < 3) continue //error(`an option "${option}" was expecting 2 values, but only got ${count-1} values`)
				const name = values[1]
				const val = values[2]

				const num = Number(val)
				if (!isNaN(num)) {
					audio.index[name] = num
				} else {
					error(`failed adding entry to index, "${val}" isn't a valid number`)
				}
				break
			}

			case "w": { // "wa" option
				if (count < 2) continue //error(`an option "${option}" was expecting 1 value, but only got ${count-1} values`)
				const val = values[1]
				const num = Number(val)
				if (!isNaN(num)) {
					audio.wa = num
				} else {
					error(`failed setting "wa" value, "${val}" isn't a valid number`)
				}
				break
			}

			case "i": { // input path option
				if (count < 1) continue //error(`an option "${option}" was expecting 1 value, but only got ${count-1} values`)
				audio.input = values[1]
				break
			}

			case "o": { // output path option
				if (count < 1) continue //error(`an option "${option}" was expecting 1 value, but only got ${count-1} values`)
				audio.output = values[1]
				break
			}

			default:
				error(`${arg} isn't a valid option, exiting`)
				break
		}
	}
}

function write_files(data) {
	Object.entries(data).forEach(entry => {
		const name = entry[0]
		const buffer = Buffer.from(entry[1]) 
		const file_path = path.join(audio.output, `${name}.mp3`)

		fs.writeFileSync(file_path, buffer)
		console.log(`wrote "${file_path}"`)
	})
}

function unpack_bin(wa, index, buffer) {
	buffer = new Uint8Array(buffer)
	if (buffer == null) error("no buffer specified, exiting")

	// such a mess, should definitely clean up later
	
	let g = false
	let f = 0
	if (buffer[0] === 0) {
		g = true
	}
	
	let c = {}
	let d = {}
	let e = {}
	Object.entries(index).forEach(p => {
		const a = p[0]
		let b = p[1]
		d[a] = []
		e[a] = []
		
		let t = buffer[b]
		if (g) {
			t |= buffer[++b] << 8
		}
		
		f += t
		
		for (let j = 0; j < t; j++) {
			if (g) {
				d[a].push(buffer[b + 1] | buffer[b + 2] << 8)
				b += 2
			} else {
				d[a].push(buffer[++b])
			}
		}
		
		for (j = 0; j < t; j++) {
			if (g) {
				e[a].push(buffer[b + 1] | buffer[b + 2] << 8)
				b += 2
			} else {
				e[a].push(buffer[++b])
			}
		}
	})
	
	let h = 2 * f + Object.keys(index).length
	if (g) {
		h *= 2
		h += 2
	}
	
	let l = buffer[h]
	h++
	
	if (g) {
		l |= buffer[h] << 8
		h++
	}
	
	Object.entries(index).forEach(p => {
		const a = p[0]
		let b = p[1]
		
		let t = 0
		d[a].forEach(y => {
			t += wa - (buffer[h + 32 * y + 2] & 2 ? 0 : 1)
		})
		
		c[a] = new ArrayBuffer(t)
		b = new Uint8Array(c[a])
		
		for (let i = 0, j = 0; j < d[a].length; j++) {
			let G = h + 32 * d[a][j]
			let N = wa - (buffer[G + 2] & 2 ? 0 : 1)
			let R = h + 32 * l + e[a][j] * (wa - 32)
			b.set(buffer.subarray(G, G + 32), i)
			i += 32
			b.set(buffer.subarray(R, R + N - 32), i)
			i += N - 32
		}
	})
	
	return c
}

// the main entrypoint
function main() {
	console.log(INTRO)
	if (ARGS.length === 0) {
		error(`no arguments provided. maybe try again, but with the \"-h\" option this time`)
	}

	// argument parsing & error handling
	parse_args(ARGS)

	if (audio.input == null) {
		error("no input file was specified")
	}

	if (!audio.input.endsWith(".bin")) {
		warn("input file doesn't end with .bin")
	}

	if (audio.output === "./out") {
		warn(`no output directory set, defaulting to "${audio.output}"`)
	}

	if (Object.keys(audio.index).length === 0) {
		error("audio index is empty, exiting")
	}

	if (audio.wa === DEFAULT_WA) {
		warn(`"wa" value is still set to "${DEFAULT_WA}", this may cause problems when unpacking`)
	}

	check_output_dir(audio.output)
	console.log("") // print an empty line for good measure :-)

	try {
		// bingle magic incoming
		console.log(`reading "${audio.input}"`)
		let buf = fs.readFileSync(audio.input)
		
		console.log("unpacking .bin file")
		const files = unpack_bin(audio.wa, audio.index, buf)

		console.log("writing audio files...")
		write_files(files)

		console.log("finished!")
	} catch(err) {
		error("an unexpected error has occured!", err)
	}
}

main()