# Podcast sync service

This is a reimplementation of the awesome [nextcloud-gpodder](https://github.com/thrillfall/nextcloud-gpodder) project in nestjs to sync podcasts. The project uses sqlite as a database and is deployable using docker (or manually if you feel like it).

The problem is there currently exist three major gpodder specifications:

- the specification used by nextcloud-gpodder
- the specification used by gpodder.net
- [the old divergent official specification by gpodder.net](https://gpoddernet.readthedocs.io/en/latest/api/index.html)

Most podcast clients use either (or both) the nextcloud-gpodder and the new gpodder.net specification but rarely the old divergent official gpodder specification (or so it seems to me).
There already exist some other selfhosted gpodder servers like [gpodder2go](https://github.com/oxtyped/gpodder2go#limitations/) or [micro-gpodder-server](https://github.com/bohwaz/micro-gpodder-server) but these implement the old divergent gpodder specification.
The fact that there are two different gpodder.net specifications is really confusing and projects to implement non interchangeable specifications. For more info look [here](https://github.com/oxtyped/gpodder2go#limitations/) and [here](https://bugs.kde.org/show_bug.cgi?id=474562).
So I created this project so I could use a have a selfhosted server that implements that nextcloud-gpodder specification without actually using a nextcloud server. The clients I mainly use this for are [Antennapod](https://antennapod.org) and [Kasts](https://apps.kde.org/kasts/).

# Installation

1. Grab the docker image from the docker packages
2. Use the `docker-compose.yaml` config from this repository

### Supported environment variables

- `PREFIX`: Sets the nestjs global prefix, this is useful when hosting under a url subdirectory (by default not set)
- `PORT`: The port the server listens on (by default 3000)

### Use UTC timezone for the server

This server needs to be run in the UTC timezone, this is the default case if not otherwise specified in docker. But if you use this project outside of docker you may have to set the timezone environment variable (e.g. `export TZ=UTC`).
The reason for this is that typeorm interprets the date in the database automatically in the local timezone and I have not found a way to remove this behavior.
