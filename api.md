# API

## 概要

ImageFlux Live StreamingのAPIは最新の[Sora SFU API](https://sora-doc.shiguredo.jp/api)と互換性を保っています。
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

クライアントが接続するシングルストリームのチャンネルを作成します。
HLS変換を行います。

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
  "encrypt_key_uri": "https://example.com/api/encrypt_key_uri",
  "auth_webhook_url": "https://example.com/api/auth_webhook_url",
  "event_webhook_url": "https://example.com/api/event_webhook_url"
}
```

- `hls` HLS変換のときのトランスコードの設定です。マルチビットレートにするには配列で複数個指定します。
  - `durationSeconds`
    - HLS配信でのセグメント時間を指定します。短く設定するほど遅延を減らすことができますが、配信あたりの転送量が増加します。
  - `startTimeOffset`
    - HLS配信での`EXT-X-START:TIME-OFFSET`パラメータを指定します。
  - `video`
    - `width`
      - 出力する幅を指定します。最小値は36です。最大値は4096です。
    - `height`
      - 出力する高さを指定します。最小値は36です。最大値は4096です。
    - `fps`
      - 秒間フレーム数(frames per second)を指定します。
    - `bps`
      - 映像の最大ビットレートを指定します。
    - `codec`
      - 映像のコーデックを指定します。有効な値は下記を参照してください。
  - `audio`
    - `bps`
      - 音声のビットレートを指定します。デフォルト値は `96000` です。
  - `archive`
    - `archive_destination_id`
      - アーカイブ保存先のIDを指定します。
      - このIDは[ImageFlux_20190205.CreateArchiveDestination](./api.md#imageflux_20190205createarchivedestination)で作成します。
      - 空文字列を指定した場合、アーカイブ保存は行われません。
- `encrypt_key_uri`
  - 会員認証APIのURLを指定します。httpsスキームのみです。
  - 未指定または空文字列を指定した場合、暗号化処理はされません。
  - auth_webhook_url, event_webhook_urlと少し似ていますが、encrypt_key_uriの末尾はURI(ユー・アール・アイ)です。
  - 会員限定配信および会員認証APIの詳細は[こちらのページ](encryption.md)を参照してください
- `auth_webhook_url`
  - 認証ウェブフックを送信するURLを指定します。
  - 認証ウェブフックの仕様はSoraのドキュメントを参照してください:
    - [認証ウェブフック](https://sora-doc.shiguredo.jp/auth_webhook)
  - 空文字列を指定した場合、すべての接続が許可されるようになります。
- `event_webhook_url`
  - イベントウェブフックを送信するURLを指定します。
  - 空文字列を指定した場合、イベントウェブフックは送信されません。
  - イベントフックの仕様はSoraのドキュメントを参照してください:
    - [イベントウェブフック](https://sora-doc.shiguredo.jp/event_webhook)

#### 利用可能な音声ビットレート

以下の値以外が指定された場合、指定されたビットレートを超えない最大の値が選択されます。
`32000` よりも小さな値が指定された場合は、 `32000` になります。

| ビットレート |      値 |
|-----------:|--------:|
|    32 kbps | 32000   |
|    40 kbps | 40000   |
|    48 kbps | 48000   |
|    56 kbps | 56000   |
|    64 kbps | 64000   |
|    80 kbps | 80000   |
| (デフォルト) 96 kbps | 96000   |
|   112 kbps | 112000  |
|   128 kbps | 128000  |
|   160 kbps | 160000  |
|   192 kbps | 192000  |
|   224 kbps | 224000  |
|   256 kbps | 256000  |
|   320 kbps | 320000  |

#### 利用可能な映像コーデック

H264のHighプロファイル、Mainプロファイル、Baselineプロファイルを指定できます。デフォルトはHighプロファイルです。
有効な値は以下の通りです。
"h264_high": H264のHighプロファイル
"h264_main": H264のMainプロファイル
"h264_baseline": H264のBaselineプロファイル

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

## ImageFlux_20200316.CreateMultistreamChannel

クライアントが接続するマルチストリームのチャンネルを作成します。
HLS変換は行いません。

### Request

```json
{
  "auth_webhook_url": "https://example.com/api/auth_webhook_url",
  "event_webhook_url": "https://example.com/api/event_webhook_url"
}
```

- `auth_webhook_url`
  - 認証ウェブフックを送信するURLを指定します。
  - 認証ウェブフックの仕様はSoraのドキュメントを参照してください:
    - [認証ウェブフック](https://sora-doc.shiguredo.jp/auth_webhook)
  - 空文字列を指定した場合、すべての接続が許可されるようになります。
- `event_webhook_url`
  - イベントウェブフックを送信するURLを指定します。
  - 空文字列を指定した場合、イベントウェブフックは送信されません。
  - イベントフックの仕様はSoraのドキュメントを参照してください:
    - [イベントウェブフック](https://sora-doc.shiguredo.jp/event_webhook)


### Response

```json
{
    "channel_id": "<channel_id>",
    "sora_url": "ws://example.com:5000/signaling",
}
```

- channel_id
  - 作成されたチャンネルの `channel_id`
- sora_url
  - 配信者が接続するSoraサーバのURL

## ImageFlux_20200316.CreateMultistreamChannelWithHLS

クライアントが接続するマルチストリームのチャンネルを作成します。
HLS変換を行います。

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
  "encrypt_key_uri": "https://example.com/api/encrypt_key_uri",
  "auth_webhook_url": "https://example.com/api/auth_webhook_url",
  "event_webhook_url": "https://example.com/api/event_webhook_url"
}
```

Request は`ImageFlux_20180905.CreateChannel`のものと同じです。


### Response

```json
{
    "channel_id": "<channel_id>",
    "sora_url": "ws://example.com:5000/signaling",
}
```

- channel_id
  - 作成されたチャンネルの `channel_id`
- sora_url
  - 配信者が接続するSoraサーバのURL

### HLSのプレイリストURLを取得する方法

マルチストリームのチャンネルのHLS変換ではHLSのプレイリストURLは配信開始後に決まります。
それを取得するのに2つの方法があります。

#### イベントウェブフックによる通知

チャンネルの作成時にイベントウェブフックを登録してください。
HLSのプレイリストURLが利用可能になったときに`"type": "notify.playlist_url"` のイベントにて通知されます。その際、イベントの内容は以下のようになります。

```json
{
  "channel_id": "<channel_id>",
  "connection_id": "<connection_id>",
  "timestamp": "2020-01-02T12:34:56.12345Z",
  "type": "notify.playlist_url",
  "playlist_url": "https://example.com/hls/XXXX/XXXXXXXX.m3u8"
}

```

#### APIによる取得

配信開始した後に数秒待ってから`ImageFlux_20200207.ListPlaylistURLs` を使用してHLSのプレイリストURLの一覧を取得してください。

## ImageFlux_20200207.ListPlaylistURLs

指定したチャンネルにあるHLSのプレイリストURLの一覧を取得します。

### Request

```json
{
    "channel_id": "<channel_id>"
}
```

- channel_id
  - チャンネルの `channel_id`

### Response

```
{
    "channel_id": "<channel_id>",
    "hls": [
        {
            "connection_id": "<connection_id>",
            "playlist_url": "https://example.com/hls/XXXX/XXXXXXXX.m3u8"
	},...
    ]
}
```

- channel_id
  - チャンネルの `channel_id`
- connection_id
  - 配信の `connection_id`
- playlist_url
  - HLSプレイリストファイルのURL
  

## ImageFlux_20180501.DeleteChannel

指定したチャンネルを削除します。
チャンネルに接続しているクライアントは強制的に切断され、HLSの生成も終了します。
以降はこのチャンネルを使用しての接続はできません。

### Request

```json
{
    "channel_id": "<channel_id>"
}
```

- channel_id
  - 削除するチャンネルの `channel_id`

## ImageFlux_20200729.ListChannelIDs

作成済みのチャンネルの`channel_id`の一覧を取得します。
不要になったchannelは[DeleteChannel](./api.md#imageflux_20180501deletechannel) APIで削除してください。

### Request

```json
{}
```

### Response

```
{
    "channel_ids": [
        "<channel_id>"
	...
    ]
}
```

- channel_ids
  - 作成済みのチャンネルの`channel_id`の配列

## ImageFlux_20180601.Stats

課金に使用される統計情報を取得します。

**このAPIは未実装です。**

## ImageFlux_20190205.CreateArchiveDestination

アーカイブ保存先を新たに作成します。

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
  - Amazon Web Servicesのリージョン名を指定します。S3以外のときは不要です。
- aws_access_key_id
  - AWSのアクセスキーIDを指定します。S3以外のときは不要です。
- aws_secret_access_key
  - AWSのシークレットアクセスキーを指定します。S3以外のときは不要です。
- gcp_credential_json
  - GCP(Google Cloud Platform)のクレデンシャルJSONを文字列で指定します。オブジェクトではなく、文字列として指定する必要があります。Google Cloud Storage以外のときは不要です。

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

## SoraのAPI

以下のSoraのAPIを利用することができます。
詳細は[SoraのAPIドキュメント](https://sora-doc.shiguredo.jp/api)を参照してください。

- Sora_20151104.DisconnectChannel
- Sora_20151104.DisconnectConnection
- Sora_20151104.Disconnect
- Sora_20151104.ListConnections
- Sora_20170814.ListChannelClients
- Sora_20160711.PushChannel
- Sora_20160711.PushClient
- Sora_20160711.PushConnection
- Sora_20160711.PushUpstream
- Sora_20160711.PushDownStream
- Sora_20170529.GetStats
- Sora_20170529.GetStatsConnection
- Sora_20190327.ChangeUpstreamVideoBitRate
- Sora_20180404.CastSpotlight
- Sora_20180404.CastAlwaysSpotlight
- Sora_20180404.CancelSpotlight
- Sora_20181023.DowngradeSpotlightBitRate
- Sora_20181023.ResetSpotlightBitRate
- Sora_20180820.ChangeSimulcastQuality

自分のアクセストークンで作成された `channel_id` 以外は指定できません。
