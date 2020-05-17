# Jailbird

A way to let your twine stories take flight.

Twine's normal flow for turning Twine/Twee stories into some-kind-of-game means dumping a bunch of tagged wrapped data somewhere in a string. This makes a whole mess of assumptions, including that your game will be html/js/css and not Unity, Godot or something even more exciting! Also this makes life very difficult for "engines" since they're now having to act as interpreters and manhandle data in realtime instead of being able to act as transformers on stories ahead of time. 

Jailbird is made up of, and includes:

+ A formal JSON schema for stories. This format includes a [JSON Schema](https://json-schema.org/) document, human descriptions and is covered under a wide open license. You're welcome to write your own converters, parsers, engines, fan art or whatever against the format. 

+ A Twine/Twee "format" for Twine/Twee/TweeGo which turns Twine stories into a mostly valid xml document for conversion into JSON. 

+ A converter that can convert most compiled stories into JSON. We supply the converter as a node library, a compiled executable, and a docker image. The converter is also heavily annotated so if you'd like to make your own version in Golang or Haskell, please do.

+ An example parser in Javascript for how to make sense and safely parse the JSON structure. This is meant for you to take and extend in your own engines/compilers, and it's licensed openly so you can re-license it as you see fit. That being said it is a functional and full featured parser so you can just steal it as is if you'd like.

We intentionally only support the latest format. If you need to convert between other compiled versions or earlier versions please use [TweeGo](https://github.com/tmedwards/tweego). We test against TweeGo specifically and package it into our docker images for it's portable nature.

## Setup

Jailbird has two parts: a Twine format and an executable. To get the executable, you can use `npm install -g jailbird`.

To install the twine format for Tweego, you'll need to download the /format folder and install it into your tweego story-formats directory.

To install the twine format for Twine itself, you can just drop in a link to the JSON file. 

Docker image with a preconfigured Tweego is coming soon!

## Community

Wrote a compatible engine or your own converter? Pulled our tools into other languages? Please open a PR or an issue and add your project! The more people who contribute, the better Jailbird can become.

## Contributing

If you'd like to just add a tool you wrote that lives somewhere else, please checkout the Community section.

If you'd like to fix a bug, add a feature, more examples or clean up our specs, please open a PR. This repo contains several subprojects that are versioned _together_, and thus working on one piece means you may need to work on others. Each subproject contains a makefile with most of the common tasks, such as `make run`, `make build` and `make test`.

## License

Covered under the MIT license. Please refer to LICENSE in this repo for license text.