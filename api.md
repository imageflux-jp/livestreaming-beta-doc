# API

βリリースの間、全てのAPI仕様は変更されることがあります。

## 概要

ImageFlux Live StreamingのAPIは最新の[Sora SFU API](https://sora.shiguredo.jp/doc/API.html)と互換性を保っています。
対応するSora SFUのバージョンは更新履歴をご確認ください。

APIの仕様は次の通りです。

- エンドポイントのパスは `/` です。
- APIは `X-Sora-Target` ヘッダで指定します。
- 全てのリクエストはHTTP POSTメソッドを使用します。
- リクエストボディにはJSONフォーマットでパラメータを指定します。

`curl` コマンドを使ってリクエストする場合は次のようになります。

```sh
curl -XPOST \
-H "Content-Type: application/json" \
-H "X-Sora-Target: ImageFlux_20180905.CreateChannel" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-d '{
  "hls": [
    {
      "durationSeconds": 1,
      "startTimeOffset": -2,
      "video": {
        "width": 640,
        "height": 480,
        "fps": 30,
        "bps": 1000000
      },
      "audio": {
        "bps": 64000
      }
    }
  ]
}' \
https://live-api.imageflux.jp/
```

## 認証

すべてのAPIはAuthorizationヘッダのBearerトークンを利用して認証を行います。
`$ACCESS_TOKEN` には事前に共有したアクセストークンを指定します。

    Authorization: Bearer $ACCESS_TOKEN

## ImageFlux_20180905.CreateChannel

クライアントが接続する新規チャンネルを作成します。

### Request

```json
{
  "hls": [
    {
      "durationSeconds": 1,
      "startTimeOffset": -2,
      "video": {
        "width": 640,
        "height": 480,
        "fps": 12,
        "bps": 2465792
      },
      "audio": {
        "bps": 64000
      },
      "archive": {
        "archive_destination_id": "<archive_destination_id>"
      }
    }
  ],
  "auth_webhook_url": "https://example.com/api/auth_webhook_url",
  "event_webhook_url": "https://example.com/api/event_webhook_url"
}
```

- `hls`
  - `durationSeconds`
    - HLS配信でのセグメント時間を指定します。短く設定するほど遅延を減らすことができますが、配信あたりの転送量が増加します。
  - `startTimeOffset`
    - HLS配信での`EXT-X-START:TIME-OFFSET`パラメータを指定します。
  - `video`
    - `width`
      - 出力する幅を指定します。
    - `height`
      - 出力する高さを指定します。
    - `fps`
      - 秒間フレーム数(frames per second)を指定します。
    - `bps`
      - 映像の最大ビットレートを指定します。
  - `audio`
    - `bps`
      - 音声のビットレートを指定します。デフォルト値は `96000` です。
  - `archive`
    - `archive_destination_id`
      - アーカイブ保存先のIDを指定します。
- `auth_webhook_url`
  - 認証ウェブフックを送信するURLを指定します。
  - 認証ウェブフックの仕様はSoraのドキュメントを参照してください:
    - [認証ウェブフック](https://sora.shiguredo.jp/doc/AUTH_WEBHOOK.html)
  - 空文字列を指定した場合、すべての接続が許可されるようになります。
- `event_webhook_url`
  - イベントウェブフックを送信するURLを指定します。
  - 空文字列を指定した場合、イベントウェブフックは送信されません。
  - イベントフックの仕様はSoraのドキュメントを参照してください:
    - [イベントウェブフック](https://sora.shiguredo.jp/doc/EVENT_WEBHOOK.html)

#### 利用可能な音声ビットレート

以下の値以外が指定された場合、指定されたビットレートを超えない最大の値が選択されます。
`32000` よりも小さな値が指定された場合は、 `32000` になります。

| ビットレート |      値 |
|-----------:|--------:|
|    32 kbps | 32000   |
|    40 kbps | 40000   |
|    48 kbps | 48000   |
|    64 kbps | 64000   |
|    80 kbps | 80000   |
|    56 kbps | 56000   |
| (デフォルト) 96 kbps | 96000   |
|   112 kbps | 112000  |
|   128 kbps | 128000  |
|   160 kbps | 160000  |
|   192 kbps | 192000  |
|   224 kbps | 224000  |
|   256 kbps | 256000  |
|   320 kbps | 320000  |

### Response

```json
{
    "channel_id": "<channel_id>",
    "sora_url": "ws://example.com:5000/signaling",
    "playlist_url": "https://example.com/hls/XXXX/XXXXXXXX.m3u8"
}
```

- channel_id
  - 作成されたチャンネルの `channel_id`
- sora_url
  - 配信者が接続するSoraサーバのURL
- playlist_url
  - HLSプレイリストファイルのURL

## ImageFlux_20180501.DeleteChannel

指定したチャンネルを削除します。
チャンネルに接続しているクライアントは強制的に切断され、HLSの生成も終了します。

### Request

```json
{
    "channel_id": "<channel_id>"
}
```

- channel_id
  - 削除するチャンネルの `channel_id`

## ImageFlux_20180601.Stats

課金に使用する統計情報を取得します。

**このAPIは未実装です。**

## ImageFlux_20190205.CreateArchiveDestination

アーカイブ保存先を新たに作成します。

**このAPIは実験的機能です。今後変更される可能性があります。**

### Request

```json
{
    "bucket_uri": "<bucket_uri>",
    "aws_region": "<aws_region>",
    "aws_access_key_id": "<aws_access_key_id>",
    "aws_secret_access_key": "<aws_secret_access_key>",
    "gcp_credential_json": "<gcp_credential_json>"
}
```

- bucket_uri
  - 保存先バケットのURIを指定します。
  - Amazon S3を指定する場合、 `s3://` スキームを用いて `s3://<my-bucket-name>/<path>/` のように入力します。
  - Google Cloud Storageを指定する場合、 `gs://` スキームを用いて `gs://<my-bucket-name>/<path>` のように入力します。
- aws_region
  - Amazon Web Servicesのリージョン名を指定します。
- aws_access_key_id
  - AWSのアクセスキーIDを指定します
- aws_secret_access_key
  - AWSのシークレットアクセスキーを指定します
- gcp_credential_json
  - GCPのクレデンシャルJSONを文字列で指定します。オブジェクトではなく、文字列として指定する必要があります。

### Response

```json
{
    "archive_destination_id": "<archive_destination_id>"
}
```

- archive_destination_id
  - 作成されたアーカイブ保存先のIDです。

## ImageFlux_20190205.DeleteArchiveDestination

作成されているアーカイブ保存先を削除します。

**このAPIは実験的機能です。今後変更される可能性があります。**

### Request

```json
{
    "archive_destination_id": "<archive_destination_id>"
}
```

- archive_destination_id
  - アーカイブ保存先のIDを指定します。

## ImageFlux_20190205.ListArchiveDestination

アーカイブ保存先の一覧を取得します。

### Request

```json
{}
```

### Response

```
{
    "archive_destinations": [
    	{
		"archive_destination_id": "<archive_destination_id>",
		"bucket_uri": "<bucket_uri>"
	},...
    ]
}
```

## Sora_20151104.ListConnections

指定したチャンネルの接続一覧を取得します。
詳細はSoraのAPIドキュメントを参照してください。

- [指定したチャネルの接続一覧を取得する](https://sora.shiguredo.jp/doc/API.html#id5)

指定されたアクセストークンで作成された `channel_id` 以外のチャンネルの情報は取得できません。

## Sora_20170814.ListChannelClients

指定したチャンネルのクライアント情報を取得します。
詳細はSoraのAPIドキュメントを参照してください。

- [指定したチャネルのクライアント情報を取得する](https://sora.shiguredo.jp/doc/API.html#id8)

指定されたアクセストークンで作成された `channel_id` 以外のチャンネルの情報は取得できません。

## Sora_20160711.PushChannel

指定したチャンネル全員にプッシュ通知を送信します。
詳細はSoraのAPIドキュメントを参照してください。

- [指定したチャネル全員にプッシュ通知を送る](https://sora.shiguredo.jp/doc/API.html#id11)

指定されたアクセストークンで作成された `channel_id` 以外は指定できません。

## Sora_20160711.PushClient

指定したクライアントにプッシュ通知を送信します。
詳細はSoraのAPIドキュメントを参照してください。

- [指定したチャネルのクライアントにプッシュ通知を送る](https://sora.shiguredo.jp/doc/API.html#id12)

指定されたアクセストークンで作成された `channel_id` 以外は指定できません。

## Sora_20160711.PushUpstream

指定したチャンネルの配信者にプッシュ通知を送信します。
詳細はSoraのAPIドキュメントを参照してください。

- [指定したチャネルの配信者にプッシュ通知を送る](https://sora.shiguredo.jp/doc/API.html#id13)

指定されたアクセストークンで作成された `channel_id` 以外は指定できません。

## Sora_20160711.PushDownStream

指定したチャンネルの視聴者にプッシュ通知を送信します。
詳細はSoraのAPIドキュメントを参照してください。

- [指定したチャネルの視聴者にプッシュ通知を送る](https://sora.shiguredo.jp/doc/API.html#id14)

指定されたアクセストークンで作成された `channel_id` 以外は指定できません。

## Sora_20170529.GetStats

指定したクライアントの統計情報を取得します。
詳細はSoraのAPIドキュメントを参照してください。

- [指定したクライアントの統計情報を取得する](https://sora.shiguredo.jp/doc/API.html#id26)

指定されたアクセストークンで作成された `channel_id` 以外は指定できません。

