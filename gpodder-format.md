# Gpodder-nextcloud api format

- I recorded the exchange between a nextcloud-gpodder server and a podcast client using [mitmproxy](https://mitmproxy.org)
- I left some stuff out (and used placeholders for some attributes) for privacy reasons

# Get subscriptions

`GET` `https://nextcloud.hense.cloud/index.php/apps/gpoddersync/subscriptions?since=0`

### Response

```json
{
  "add": ["[podcast url]"],
  "remove": [],
  "timestamp": 1712342171
}
```

# Create subscription changes

`POST` `https://nextcloud.hense.cloud/index.php/apps/gpoddersync/subscription_change/create`

### Request

```json
{
  "add": ["[podcast url]"],
  "remove": []
}
```

### Response

```json
{
  "timestamp": 1712342177
}
```

# Get episode actions

`GET` `https://nextcloud.hense.cloud/index.php/apps/gpoddersync/episode_action?since=0`

### Response

```json
{
  "actions": [
    {
      "action": "PLAY",
      "episode": "[episode url]",
      "guid": "[guid tag]",
      "podcast": "[podcast url]",
      "position": 100,
      "started": 100,
      "timestamp": "2024-01-11T00:00:00",
      "total": 100
    }
  ],
  "timestamp": 1712342180
}
```

# Create episode actions

`POST` `https://nextcloud.hense.cloud/index.php/apps/gpoddersync/episode_action/create`

### Request

```json
[
  {
    "action": "play",
    "device": "",
    "episode": "[episode url]",
    "guid": "[guid]",
    "podcast": "[gpodcast url]",
    "position": 100,
    "started": 100,
    "timestamp": "2024-01-01T00:00:00",
    "total": 3000
  }
]
```

### Response

```json
{
  "timestamp": 1712351308
}
```
