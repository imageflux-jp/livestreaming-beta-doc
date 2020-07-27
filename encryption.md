# 会員限定配信

HLS暗号化機能を使うことで、お客様のWebサイト・アプリ・サービス(以下、Webサイト)の特定の会員に限定した配信をすることができます。たとえば、有料会員のみが視聴でき、ログアウトした会員と退会した会員と未登録ユーザーは視聴できない、といった機能を実現できます。

## 目次
* 暗号鍵の会員認証APIの作成
* GetEncryptKey APIの仕様
* 会員認証APIのURL登録
* 制限事項

## 暗号鍵の会員認証APIの作成
会員限定配信機能を実現するには、暗号化した動画データを復号する「鍵」と呼ばれる16バイトのデータを中継するためのAPIがお客様のWebサイト上に必要です。APIはお客様のWebサイトで使用している開発言語やフレームワークにより様々です。node.jsでのサンプルを[こちら](sample/encryption/routes/index.js)に公開しています。処理の概要を説明します。

1. 動画の再生開始直後にHLSプレイヤーからHTTPのGETメソッドで会員認証APIが呼び出されます。
2. Cookieセッションを用いて、視聴権限の有無を判定します。視聴権限のないユーザーからのリクエストに対しては40Xエラー(404など)を返します。
3. 視聴権限のあるユーザーからのリクエストであれば、会員認証APIのクエリストリングに含まれているkidを元に、GetEncryptKey APIを呼び、鍵データを取得します。GetEncryptKey APIは16進数32文字の文字列を含んだJSONを返します。16進数をバイナリに変換し、16バイトのバイナリ形式でレスポンスを返します。

![getencryptkey](getencryptkey.png)


視聴権限については、お客様のWebサイトの方針で決めてください。
例1) ログイン中の会員は視聴可能、ログアウト済み会員と未登録ユーザーは視聴不可
例2) 有料会員は視聴可能、無料会員は視聴不可、ログアウト会員は視聴不可
例3) 有料会員は視聴可能、無料会員はサンプルのみ視聴可能、未登録ユーザーは視聴不可

16進数をバイナリに変換する処理は各開発言語によります。
node.jsでは下記のように記述することでバイナリデータになります。
```
const encrypt_key_hex = JSON.parse(json).encrypt_key;
const encrypt_key_bin = new Buffer(encrypt_key_hex, "hex");
```


## GetEncryptKey APIの仕様

会員認証APIからImageFlux API Endpointに対して、GetEncryptKey APIを呼び出すと、該当するチャンネルの鍵が16進数32文字の形式でJSONを返します。

### Request
```
{
  "kid": "＜kid＞"
}
```

- `kid`
  - 会員認証APIのクエリストリングに含まれているkidを指定します。

### Response
```
{
    "encrypt_key": "0123456789abcdef0123456789abcdef"
}
```

Responseに含まれる項目は、今後増える可能性があります。

curl コマンドを使ってリクエストする場合は次のようになります。

```
curl -XPOST \
-H "Content-Type: application/json" \
-H "X-Sora-Target: ImageFlux_20200707.GetEncryptKey" \
-H "Authorization: Bearer ${ACCESS_TOKEN}" \
-d '{"kid":"＜kid＞"}' \
https://live-api.imageflux.jp/
```
$ACCESS_TOKEN には事前に共有したアクセストークンを指定します。



## 会員認証APIのURL登録

CreateChannel APIまたはCreateMultistreamChannelWithHLS APIに会員認証APIのURLを指定します。
### Request
```
{
  "hls": [
    {
      "durationSeconds": 2,
      "startTimeOffset": -2,
      "video": {"width": 640,"height": 480},
      "audio": {"bps": 64000}
    }
  ],
  "encrypt_key_uri": "＜encrypt_key_uri＞",
  "auth_webhook_url": "https://example.com/api/auth_webhook_url",
  "event_webhook_url": "https://example.com/api/event_webhook_url"
}
```
encrypt_key_uri 以外のオプションおよびレスポンスについては[こちらのページ](api.md)をご参照ください。encrypt_key_uriの指定の有無によるレスポンスの変更はありません。
- `encrypt_key_uri`
  - 会員認証APIのURLを指定します。httpsスキームのみです。encrypt_key_uriを未指定または空文字列を指定した場合、暗号化処理はされません。
auth_webhook_url, event_webhook_urlと少し似ていますが、encrypt_key_uriの末尾はURI(ユー・アール・アイ)です。

HLSのマニフェストファイルの先頭付近に下記のように出力され、HLSの視聴開始時に使用されます。encrypt_key_uriの値の末尾に鍵を識別するためのIDとして "&kid=＜kid＞"または"?kid=＜kid＞" が付与されます。
```
#EXT-X-KEY:METHOD=AES-128,URI="＜encrypt_key_uri＞&kid=＜kid＞"
```

## 制限事項

本機能を使用した会員認証は厳密なDRMではありません。暗号化処理と会員認証を行ったとしても、視聴権限のあるユーザーが、ブラウザのキャッシュから動画に関連するファイル一式をコピーした場合、お客様のWebサイトを退会しても見ることができます。
