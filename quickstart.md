# クイックスタート

WebRTCで映像音声を送信し、HLSで視聴するときの手順を説明します。

1. 配信するチャンネルを作成する
2. チャンネルに対し配信クライアントがWebRTCで接続する
3. チャンネルを削除する

## 配信するチャンネルを作成する

配信を開始するにはまずチャンネルを作成します。
チャンネルを作成するにはCreateChannel APIを呼び出します。
チャンネルのパラメータには生成するHLSのパラメータとウェブフックの送信先URLを指定します。ウェブフックの送信先URLは省略可能です。

すべてのAPI呼び出しにはアクセストークンが必要です。アクセストークンはAuthorizationヘッダに指定します。

## チャンネルに対し配信クライアントがWebRTCで接続する

指定したチャンネルに対し、配信クライアントがWebRTCで接続して、映像、音声を送信します。
接続して数秒後にHLSのプレイリストファイルが作成されてHLS配信が開始されます。

## チャンネルを削除する

チャンネルを使い終わったら、DeleteChannel APIを呼び出してチャンネルを削除します。
まだ接続中のチャンネルを削除した場合には強制的に切断されます。
チャンネルを削除しない場合、意図せずそのチャンネルが再利用されてしまったときに予期しない課金が発生することがあります。


何度も配信をする場合には、同じチャンネルを使いまわすのでなく配信のたびに新たにチャンネルを作ってください。

# 具体的な手順

最小限の方法で配信の動作確認をする手順を紹介します。この確認はmacOS Catalina 10.15.4 で行いました。

## 準備
ImageFlux livestreaming のアカウント開設時に発行してもらったアクセストークンの文字列を手元に用意してください。

sora Javascript SDKサイトから　sora.min.js をダウンロードします。

```
curl -OL https://raw.githubusercontent.com/shiguredo/sora-js-sdk/master/dist/sora.min.js
```

カレントディレクトリをブラウザから開けるようにするために、python3でHTTPサーバをうごかしておきます。

```
python3 -m http.server 8000
```

## ImageFlux livestreaming のAPIでチャンネルを生成する

curlで次のコマンドを実行するとチャンネルが作成され、その情報がJSONで返ってきます。
`ACCESS_TOKEN`のところは自分のアクセストークンの文字列に変更してください。

```
ACCESS_TOKEN="XXXXXXXXXXXXXXXXXXXXXXXXX"
curl -XPOST -H "Content-Type: application/json" -H "X-Sora-Target: ImageFlux_20180905.CreateChannel" -H "Authorization: Bearer ${ACCESS_TOKEN}" -d '
{
  "hls": [
    {
      "durationSeconds": 1,
      "startTimeOffset": -2,
      "video": {
        "width": 1280,
        "height": 720,
        "fps": 30,
        "bps": 2000000
      },
      "audio": {
        "bps": 96000
      }
    },
    {
      "durationSeconds": 1,
      "startTimeOffset": -2,
      "video": {
        "width": 640,
        "height": 360,
        "fps": 30,
        "bps": 500000
      },
      "audio": {
        "bps": 96000
      }
    }
  ]
}
' https://live-api.imageflux.jp/
```

レスポンスは以下のような内容のJSON形式となります。
これをファイルに保存するなどして覚えておいてください。


```
{
  "channel_id": "XXXXXXXXXXXXX....",
  "sora_url": "wss://XXXXXXXX.imageflux.jp/signaling",
  "playlist_url": "https://XXXXXXXXXXXX.imageflux.jp/XXXXXXXXXXXXXXXXXXXX.m3u8"
}
```

`channel_id` と`sora_url` はsoraに対してWebRTCで接続するときに使用します。  
`playlist_url` はHLSで視聴するときに使用します。

APIについての詳細は以下を参照してください。
https://github.com/imageflux-jp/livestreaming-beta-doc


### 送信側

[send.html](./sample/send.html)をダウンロードして、`channel_id`と`sora_url`を先ほど取得したものに置き換えます。

```send.html
...
	<script type="text/javascript">
	 const channel_id = 'XXXXXXXXXXXXX....';
	 const sora_url = 'wss://XXXXXXXX.imageflux.jp/signaling';
	 const metadata = {};
...	 
```
### WebRTCでの受信

[recv.html](./sample/recv.html)をダウンロードして、`channel_id`と`sora_url`を先ほど取得したものに置き換えます。

```recv.html
...
	<script type="text/javascript">
	 const channel_id = 'XXXXXXXXXXXXX....';
	 const sora_url = 'wss://XXXXXXXX.imageflux.jp/signaling';
	 const metadata = {};
...	 
```

### HLSでの受信

[hls.html](./sample/hls.html)をダウンロードして、`playlist_url`を先ほど取得したものに置き換えます。

```hls.html
...
	<script>
	 const playlist_url = 'https://XXXXXXXXXXXX.imageflux.jp/XXXXXXXXXXXXXXXXXXXX.m3u8';
	 const video = document.getElementById('video');
...	 
```

### WebRTCでの送信と受信とHLSでの視聴を試す

Chromeブラウザで以下のそれぞれのURLを開きます。

http://localhost:8000/send.html  
http://localhost:8000/recv.html  
http://localhost:8000/hls.html  

送信するときに、カメラとマイクの使用許可を求めるダイアログが出るので許可します。
再生は自動で開始されます。音声はmute状態になっているので、画面上のボタンを操作してmuteを解除してください。

(MacOS 10.15の場合、Chromeから初めて送信を行う際には、マイクとカメラの使用を許可するためのコントロールパネルのセキュリティの設定の登録がChromeからうながされます。その指示に従って、Chromeを追加してください。)

次はこれらのファイルを、httpsのサーバに置いてやってみてください。
(https でないとブラウザからカメラやマイクを使用することができません。)


## チャンネルの削除

使い終わったチャンネルは以下のコマンドで削除します。
`ACESS_TOKEN` のところは自分のアクセストークンの文字列に、`CHANNEL_ID`のところは削除するchannel_idの文字列に置き換えてください。

```
ACCESS_TOKEN="XXXXXXXXXXXXXXXXXXXXXXXXX"
CHANNEL_ID="XXXXXXXXXXXXX...."

curl -v \
  -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "x-sora-target: ImageFlux_20180501.DeleteChannel" \
  -d "{ \"channel_id\": \"${CHANNEL_ID}\" }" \
https://live-api.imageflux.jp/
```


