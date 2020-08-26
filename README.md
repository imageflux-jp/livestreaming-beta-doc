# ImageFlux Live Streaming ドキュメント

**ライブ動画配信**

ImageFlux Live Streaming はライブの動画配信を行うためのプラットフォームです。WebRTCを使ってWebブラウザ(またはWebRTCクライアントソフト)から配信を行います。エンドユーザーに対しては、配信された内容をいくつかの方法で視聴させることができます。少人数や双方向通信をする場合にはWebRTCが利用できます。大人数に対して片方向の通信をする場合にはHLSが利用できます。その両方を組み合わせることもできます。


- [クイックスタート](./quickstart.md)
- [APIドキュメント](./api.md)
- [アーカイブの保存](./archive.md)
- [会員限定配信](./encryption.md)

## APIエンドポイント
```
https://live-api.imageflux.jp/
```

## 変更履歴

- 2019/03/15 初版公開
- 2020/03/25 マルチストリーム対応のAPIを追加しました。
- 2020/04/16 Sora APIの項目を追加しました。
- 2020/07/27 HLS暗号化の機能を追加しました。その使い方の説明として[会員限定配信](./encryption.md)のページを追加しました。
- 2020/08/05 [作成済みのチャンネルのchannel_idの一覧を取得するAPI](./api.md#imageflux_20200729listchannelids)を追加しました。
- 2020/08/25 [チャンネル作成のAPI](./api.md#imageflux_20180905createchannel)に映像コーデックの指定を追加しました。

# Copyright

(c) 2019 pixiv Inc. All rights reserverd.
