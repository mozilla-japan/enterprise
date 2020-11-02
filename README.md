[www.mozilla.jp](https://www.mozilla.jp) の静的サイト化に伴い、このツールは不要となりました。今後は [business/faq/tech](https://github.com/mozilla-japan/www.mozilla.jp/tree/main/content/business/faq/tech) 以下の Markdown ファイルを更新すれば自動的に Netlify 上でビルド・デプロイされます。

* * *

# 法人向け技術情報 FAQ

このツールは、FAQ.md を元に、https://www.mozilla.jp/business/faq/tech/ 以下のファイルを生成するツールです。

## 設定

1. このレポジトリをクローンします
    ```sh
    $ git clone git@github.com:mozilla-japan/enterprise.git
    ```
2. enterprise に移動します
    ```sh
    $ cd enterprise
    ```
3. [node.js](https://nodejs.org/) と [npm](https://www.npmjs.com/) をインストールします
4. [gulp](http://gulpjs.com/) をインストールします
  
    ```sh
    $ npm install -g gulp
    ```
5. npm コマンドを利用して、本ツールの依存するライブラリをインストールします
    ```sh
    $ npm install
    ```
6. `etc/settings.json` を編集します（オプショナル）


## 更新作業

1. `gulp build` を実行します
    ```sh
    $ gulp build
    ```
2. dist/ 以下のファイルを適切なフォルダにコピーします
    ```sh
    $ cp -r dist/* ~/mozilla.jp/business/faq/tech/
    ```
注意：コピー先のフォルダは適切に読み替えること
3. 正しく表示できるか確認し、問題無ければ公開する
