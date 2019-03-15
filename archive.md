# HLSの外部アーカイブ機能

アーカイブ機能を使うことで、HLSプレイリストを外部のストレージ (Amazon S3, Google Cloud Storage)に対して保存することができます。
ストレージに保存できるのはアダプティブストリーミングのファイルではなく、指定した単一解像度のプレイリストとその動画セグメントファイルです。

**この機能は実験的な機能です。今後変更される可能性があります。**

## アーカイブを設定する

アーカイブ保存先を設定するにはCreateArchiveDestination APIを利用します。
CreateArchiveDestination APIには保存先のバケットURIと、保存に必要な認証情報を指定します。
Amazon S3の場合はAccess Key IDとSecret Access Key、GCSの場合はJSON形式のサービスアカウントの認証情報が必要です。
JSON形式の認証情報はJSONオブジェクトではなく、文字列形式で指定する必要があります。

```
curl -XPOST \
-H "Content-Type: application/json" \
-H "X-Sora-Target: ImageFlux_20190205.CreateArchiveDestination" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-d '{
  "bucket_uri": "gs://<my-bucket-name>",
  "gcp_credential_json": "{...}",
}' \
https://live-api.imageflux.jp/
```

## アーカイブのウェブフック通知

アーカイブの保存が完了した場合、ウェブフック通知が送られます。

### ファイルが作成された場合

ウェブフック通知はファイルがストレージ上に作成されるたびに通知されます。
動画の再生に必要なプレイリストが作成された場合、 `file_type` パラメータが `m3u8` になります。

```
{
  "channel_id": "<channel_id>",
  "type": "imageflux.archive_created",
  "data": {
    "dest_uri": "<dest_uri>",
    "file_path": "<file_path>",
    "size": "<size>",
    "file_type": "<file_type>"
  }
}
```

- channel_id
  - チャンネルのIDです
- type
  - Webhookのtypeは `imageflux.archive_created` になります
- data
  - dest_uri
    - アーカイブされたファイルの保存先URI
  - file_path
    - 指定されたバケットURI以下のファイルパス
  - size
    - ファイルサイズ
  - file_type
    - 動画セグメントが保存された場合: ts
    - M3U8プレイリストが保存された場合: m3u8

### ファイルの保存に失敗した場合

ファイルの保存に失敗した場合、以下のウェブフックが通知されます。

```
{
  "channel_id": "<channel_id>",
  "type": "imageflux.archive_failed",
  "data": {
    "dest_uri": "<dest_uri>",
    "file_path": "<file_path>",
  }
}
```

- channel_id
  - チャンネルのIDです
- type
  - Webhookのtypeは `imageflux.archive_failed` になります
- data
  - dest_uri
    - アーカイブされたファイルの保存先URI
  - file_path
    - 指定されたバケットURI以下のファイルパス
