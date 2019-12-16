# 設定の管理

## 設定を管理者が管理したい {#control-configurations-by-administrator}

キーワード：機能制限、導入時初期設定、集中管理

FirefoxやThunderbirdには、設定を管理者が管理し、ユーザが自由に変更できないようにするための機能が備わっています。

Firefox ESR60以降のバージョンでは、Active DirectoryのグループポリシーまはたJSON形式のポリシー定義ファイルを用いて設定を集中管理できます。
また、従来からの設定の集中管理の仕組みである「Mission Control Desktop（MCD、あるいはAutoConfig）」も使用できます。


### グループポリシーでの実現 {#group-policy}

[ポリシーテンプレート](https://github.com/mozilla/policy-templates)を使用してグループポリシー経由で設定の集中管理を行えます。
[最新のリリース版ポリシーテンプレート](https://github.com/mozilla/policy-templates/releases)をダウンロードしてドメインコントローラに読み込ませ、各種の設定をActive Directory上で行うと、ドメインに参加したWindows PC上でFirefoxを起動する度に、グループポリシーで変更された設定が読み込まれ、反映されるようになります。

#### 注意点

 * 上記ページからダウンロードできる管理用テンプレートファイルの内容は日本語化されていません。
   日本語で設定を管理したい場合は、管理用テンプレートファイルを自分で翻訳する必要があります。
 * 管理できる設定項目は、管理用テンプレートファイルに記述されている物のみとなります。
   それ以外の設定を管理したい場合は、[MozillaのBugzilla](https://bugzilla.mozilla.org/)経由で設定項目の追加を提案する必要があります。


### ポリシー定義ファイルでの実現 {#policies-json}

Active Directoryを運用していない場合や、Windows以外のプラットフォームでは、JSON形式のポリシー定義ファイルを設置する事によって、グループポリシーと同様の設定の集中管理を行えます。

#### 設定方法

以下のような内容のプレーンテキストファイル `policies.json` を用意します。

    {
      "policies": {
        "DisableAppUpdate": true
      }
    }

この例ではアプリケーションの自動更新を停止する設定のみを記述しています。
記述可能な設定項目については、[ポリシーテンプレートのリポジトリ内にある説明（英語）](https://github.com/mozilla/policy-templates/blob/master/README.md)や[株式会社クリアコードのブログ内の解説](https://www.clear-code.com/blog/2018/5/12.html)などを参照して下さい。

次に、作成した `policies.json` を、Firefoxのインストール先の `distribution/` ディレクトリに置きます（Windowsであれば、 `C:\Program Files\Mozilla Firefox\distribution\policies.json` など）。

以上で設定は完了です。

#### 注意点

 * 管理できる設定項目は、グループポリシーで設定可能な項目のみとなります。
   それ以外の設定を管理したい場合は、[MozillaのBugzilla](https://bugzilla.mozilla.org/)経由で設定項目の追加を提案する必要があります。


### MCD用設定ファイルでの実現 {#mcd}

以下では、Firefoxの自動アップデートを禁止するという場合を例にとって設定の手順を説明します。

#### 設定方法

以下の内容のプレーンテキストファイル `autoconfig.js` を用意します。

    pref("general.config.filename", "autoconfig.cfg");
    pref("general.config.vendor", "autoconfig");
    pref("general.config.obscure_value", 0);
    // 「globalChrome.css読み込み用スクリプト」を使用する場合は以下の行も必要です。
    pref("general.config.sandbox_enabled", false);

作成した `autoconfig.js` を、Firefoxのインストール先の `defaults/pref/` ディレクトリに置きます（Windowsであれば、 `C:\Program Files\Mozilla Firefox\defaults\pref\autoconfig.js` など）。

以下の内容のプレーンテキストファイル `autoconfig.cfg` を用意します。

    // 1行目は必ずコメントとしてください。
    lockPref("app.update.enabled", false);

作成した `autoconfig.cfg` を、FirefoxまたはThunderbirdのインストール先ディレクトリに置きます（Windowsであれば、 `C:\Program Files\Mozilla Firefox\autoconfig.cfg` など）。

以上で設定は完了です。

#### 確認方法

Firefoxを起動してオプション（設定画面）を開き、`詳細`→`更新`と辿って、自動更新に関する設定が`更新の確認は行わない`で固定されグレイアウトされていることを確認して下さい。

#### 詳細情報

`autoconfig.cfg` では以下の3つのディレクティブでFirefox・Thunderbirdの設定を管理することができます。

 * `defaultPref("設定名", 値)`
   ：設定を指定した値に変更します。ユーザは設定を自由に変更でき、変更後の値はFirefox・Thunderbirdの終了後も保存されます。
 * `pref("設定名", 値)`
   ：設定を指定した値に変更します。ユーザは設定を一時的に変更できますが、変更後の値はFirefox・Thunderbirdを終了すると失われます。（次回起動時には、`autoconfig.cfg` で指定した値に戻ります。）
 * `lockPref("設定名", 値)`
   ：設定を指定した値に固定します。ユーザは設定を変更することはできません。

また、`autoconfig.cfg` ではJavaScriptの制御構文や環境変数の参照、LDAPサーバからの情報の取得（※Tunderbirdのみ）も利用できます。
詳しくは以下の情報を参照して下さい。

 * [Mozilla 製品の集中管理 - 基本編 - MCD | MDN](https://developer.mozilla.org/ja/docs/MCD/Getting_Started)
 * [MCD, Mission Control Desktop AKA AutoConfig | MDN](https://developer.mozilla.org/ja/docs/MCD,_Mission_Control_Desktop_AKA_AutoConfig)

設定を変更する場合は、新しい `autoconfig.cfg` で古い `autoconfig.cfg` を上書きして下さい。

`autoconfig.cfg` で管理できる設定項目は、about:config（設定エディタ）の一覧に表示される物、もしくは一覧に現れていない隠し設定のみに限られます。
アドオンの有効・無効の状態、Webサイトごとの機能の利用許可、メニュー項目の表示・非表示などは、`autoconfig.cfg` では管理できません。

なお、Firefox 43以前では、設定画面の「プライバシー」パネルに対応する設定を `pref()` や `defaultPref()` で変更した場合、設定ダイアログを開いた時の状態が期待通りに初期化されない場合があります。この問題の簡単な回避策としては、アドオン [History Prefs Modifier][]が利用できます。Firefox 44以降ではこの問題は修正されています。

<!--
defaultPref()だけを使うのであれば、distribution/distribution.iniで以下のようにするという手もある。

    [Preferences]
    mozilla.partner.id="testpartner"
    app.distributor="testpartner"
    app.distributor.channel=
    browser.search.distributionID="com.testpartner"
    
    [LocalizablePreferences]
    browser.startup.homepage="http://sandmill.org/%LOCALE%/%LOCALE%/"
    browser.startup.homepage_reset="http://sandmill.org/%LOCALE%/"

 * [Customizing Firefox – distribution.ini | Mike's Musings](http://mike.kaply.com/2012/03/26/customizing-firefox-distribution-ini/ "Customizing Firefox – distribution.ini | Mike's Musings")
 * [Creating a Customized Firefox Distribution | Mike's Musings](http://mike.kaply.com/2010/08/05/creating-a-customized-firefox-distribution/ "Creating a Customized Firefox Distribution | Mike's Musings")

が、話がややこしくなるので、ここでは触れないことにする。
-->



## すべてのクライアントの設定を管理者が一括して変更したい

キーワード：機能制限、導入時初期設定、集中管理

Active Directoryドメインに参加しているWindows PCでは、[グループポリシー](#group-policy)によって、管理者が全クライアントの設定を一括して管理・変更することができます。

グループポリシーを使用しない場合でも、FirefoxやThunderbirdの独自の設定管理機能である[MCD（AutoConfig）](#mcd)では、各クライアントのローカルディスク上に設置した設定ファイルだけでなく、サーバ上に設置した設定ファイルを読み込ませることができます。
これにより、管理者が1つの設定ファイルを管理するだけで全クライアントの設定を一括して管理・変更するという運用が可能です。

以下では、設定ファイルを `http://internalserver/autoconfig.jsc` として提供してFirefoxの自動アップデートを禁止するという場合を例にとってMCDでの設定の手順を説明します。

### 設定方法

以下の内容のプレーンテキストファイル `autoconfig.js` を用意します。

    pref("general.config.filename", "autoconfig.cfg");
    pref("general.config.vendor", "autoconfig");
    pref("general.config.obscure_value", 0);

作成した `autoconfig.js` を、Firefoxのインストール先の `defaults/pref/` ディレクトリに置きます（Windowsであれば、`C:\Program Files\Mozilla Firefox\defaults\pref\autoconfig.js` など）。

以下の内容のプレーンテキストファイル `autoconfig.cfg` を用意します。

    // 1行目は必ずコメントとしてください。
    lockPref("autoadmin.global_config_url", "http://internalserver/autoconfig.jsc");

作成した `autoconfig.cfg` を、FirefoxまたはThunderbirdのインストール先ディレクトリに置きます（Windowsであれば、`C:\Program Files\Mozilla Firefox\autoconfig.cfg` など）。

以下の内容のプレーンテキストファイル `autoconfig.jsc` を用意します。

    // 1行目は必ずコメントとしてください。
    lockPref("app.update.enabled", false);

次に、上記のURLにてファイルをダウンロード可能なように、設定ファイルの提供用サーバにファイルを設置します。
また、ファイルは以下のMIME Typeを伴って送信されるように設定します。

    application/x-javascript-config

以上で設定は完了です。

### 確認方法

Firefoxを起動してオプション（設定画面）を開き、`詳細`→`更新`と辿って、自動更新に関する設定が`更新の確認は行わない`で固定されグレイアウトされていることを確認して下さい。

### 詳細情報

`autoconfig.jsc` の書式と設定可能な設定項目の種類は、autoconfig.cfgと同一です。詳細は[設定を管理者が管理したい](#control-configurations-by-administrator)を参照して下さい。

なお、`autoconfig.jsc` はWebサーバでの提供以外に、ローカルファイル、ファイル共有サーバ上のファイルなどの形でも提供できます。以下はすべて有効な指定です。

    // ローカルファイルとして提供する場合（ネットワークドライブをマウントする場合など）
    lockPref("autoadmin.global_config_url", "file:///Z:/firefox/autoconfig.jsc");
    
    // Sambaサーバ、NASなどの上にファイルを設置する場合
    lockPref("autoadmin.global_config_url", "file://///file-server/shared/firefox/autoconfig.jsc");





## Thunderbirdのアカウント設定を非表示にしたい（管理者が設定を集中管理するので、アカウント設定の画面にアクセスさせたくない）

キーワード：機能制限、導入時初期設定、集中管理

[MCD（AutoConfig）](#mcd)や[グループポリシー](#group-policy)などの方法でアカウント設定を管理者が管理する際に、ユーザがアカウント設定の画面にアクセスできないようにすることができます。

### 設定方法

アカウント設定画面へのアクセス経路をUI上に表示しないようにするためには、[globalChrome.css読み込み用スクリプト][]を使ってメニュー項目を隠す必要があります。globalChrome.css を使う場合の手順は以下の通りです。

 1. 「メモ帳」などのテキストエディタを開き、開発ツールで調べたIDを使って項目を非表示にするスタイル指定を記述します。

        @-moz-document url-prefix(chrome://messenger/content/) {
          #menu_accountmgr,
          #appmenu_accountmgr,
          #appmenu_newAccountPopupMenuSeparator,
          #appmenu_newCreateEmailAccountMenuItem,
          #appmenu_newMailAccountMenuItem,
          #appmenu_newIMAccountMenuItem,
          #appmenu_newFeedAccountMenuItem,
          #appmenu_newAccountMenuItem {
            display: none !important;
          }
        }
        @-moz-document url-prefix(chrome://messenger/content/msgAccountCentral.xul) {
          #AccountsHeader,
          #AccountSettings.spacer,
          #AccountSettings,
          #CreateAccount.spacer,
          #CreateAccount,
          #CreateAccounts,
          #AccountsSection.spacer {
            display: none !important;
          }
        }
    
    （ `@-moz-document` は、特定のウィンドウに対してのみスタイル指定を反映させるための記述です。詳細は[@-moz-document について参考][]を参照して下さい。）
 2. 1で作成した内容を `globalChrome.css` という名前のプレーンテキストファイルに保存します。
 3. 2で作成したファイルをThunderbirdのインストール先の `chrome` フォルダに設置します。
    （Windows Vista以降の場合のファイルの設置場所は `C:\Program Files\Mozilla Thunderbird\chrome\globalChrome.css` となる。）
 4. [MCD用設定ファイル](#mcd)を作成し、`autoconfig.cfg` に[globalChrome.css読み込み用スクリプト][]の内容を張り付けて設置します。






## about:config（設定エディタ）の利用を禁止したい

キーワード：機能制限、導入時初期設定、集中管理

無用なトラブルを避けるため、ユーザが `about:config`（設定エディタ）の画面にアクセスできないようにすることができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`BlockAboutConfig`](https://github.com/mozilla/policy-templates/blob/master/README.md#blockaboutconfig) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "BlockAboutConfig": true
      }
    }

これにより、`about:config` の読み込みがブロックされ、設定を変更できない状態になります。






# アドオン、プラグイン

## アドオンの利用を禁止したい（ユーザが任意にアドオンをインストールできないようにしたい）

キーワード：機能制限、導入時初期設定、集中管理、アドオン

無用なトラブルを避けるため、ユーザが任意にアドオンをインストールできないよう設定することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`BlockAboutAddons`](https://github.com/mozilla/policy-templates/blob/master/README.md#blockaboutaddons) を `true` に、[`InstallAddonsPermission.Default`](https://github.com/mozilla/policy-templates/blob/master/README.md#installaddonspermission) を `false` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "BlockAboutAddons": true,
        "InstallAddonsPermission": {
          "Default": false
        }
      }
    }

これにより、アドオンマネージャの読み込みがブロックされ、設定を変更できない状態になります。
また、アドオンのインストール操作も禁止されるようになります。

### 注意事項

この設定は、既にインストール済みの他のアドオンの状態を変更しません。
既にインストール済みのアドオンをシステム管理者の判断で強制的に無効化する方法は、[特定のアドオンを常に無効化したい](#disable-addons-by-administrator)を参照して下さい。




## 特定のアドオンを常に無効化したい {#disable-addons-by-administrator}

キーワード：機能制限、導入時初期設定、集中管理、アドオン、プラグイン

既に導入されているアドオンを、システム管理者の判断で強制的に無効化（アンインストール）することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`Extensions.Uninstall`](https://github.com/mozilla/policy-templates/blob/master/README.md#extensions) に無効化したいアドオンのIDを列挙して下さい。
例えば、[Duplicate Tabs Closer][]であれば以下の要領です。

    {
      "policies": {
        "Extensions": {
          "Uninstall": ["jid0-RvYT2rGWfM8q5yWxIxAHYAeo5Qg@jetpack"]
        }
      }
    }

これにより、IDが一致するアドオンが、次回以降の起動時に自動的にアンインストールされます。
（アドオンをインストールしたまま無効化状態とすることはできません。）




## 管理者によるアドオンのインストール手順 {#install-addons-by-administrator}

キーワード：導入時初期設定、アドオン

FirefoxやThunderbirdは通常、ユーザが任意のアドオンをインストールして使用します。
以下の手順に則ると、管理者が、そのクライアント上のすべてのユーザを対象としてアドオンをインストールすることができます。

以下、[Duplicate Tabs Closer][]をインストールする場合を例にとって解説します。

#### パターン1：起動時に自動的にインストールされるアドオンとして登録する

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`Extensions.Install`](https://github.com/mozilla/policy-templates/blob/master/README.md#extensions) にアドオンのXPIファイルのURLまたはパスを列挙して下さい。
例えば、`192.168.0.10` のホストをファイル配信に使用するのであれば以下の要領です。

    {
      "policies": {
        "Extensions": {
          "Install": [
            "https://192.168.0.10/duplicate_tabs_closer-3.4.1-fx.xpi"
          ]
        }
      }
    }

`192.168.0.10` がWindowsのファイルサーバーまたはSambaサーバーである場合、UNCパスを用いた以下の指定の仕方も可能です。

    {
      "policies": {
        "Extensions": {
          "Install": [
            "file:////192.168.0.10/shared/duplicate_tabs_closer-3.4.1-fx.xpi",
            "\\\\\\\\\\192.168.0.10\\shared\\duplicate_tabs_closer-3.4.1-fx.xpi"
          ]
        }
      }
    }

これにより、次回以降の起動時に、各アドオンが自動的にユーザープロファイル配下へアンインストールされます。

この手順でインストールしたアドオンは以下の特徴を持ちます。

 * *既に存在しているユーザプロファイルでFirefoxを起動した場合も、当該アドオンはインストールされます*。
 * 当該アドオンは、ユーザが自分でインストールしたのと同じ扱いになります。
   * 当該アドオンはアドオンマネージャ上に表示されます。
   * *ユーザは当該アドオンを削除できます。*
   * *ユーザは当該アドオンを無効化できます。*
 * *当該アドオンは自動更新されます。*

自動更新を利用できない場面において、この方法でインストールしたアドオンを更新するためには、同じアドオンをバージョン番号を付与した別のURLまたはバージョン番号を付与した別のパスで`Extensions.Install`に列挙し直して再インストールする必要があります。

#### パターン2：初回起動時（新規プロファイル作成時）に自動的にインストールされるアドオンとして登録する

この場合のインストール手順は以下の通りです。

 1. Firefoxの実行ファイルと同じ位置に `distribution` という名前でフォルダを作成します。
    Firefoxが `C:\Program Files\Mozilla Firefox` にインストールされている場合、作成するフォルダのパスは `C:\Program Files\Mozilla Firefox\distribution` となります。
 2. 1.で作成したフォルダの中に `extensions` という名前でフォルダを作成します。
 3. 2.で作成したフォルダの中に、インストールしたいアドオンのインストールパッケージ（xpiファイル）を設置します。ファイル名はアドオンの内部的なIDに合わせて変更します。
    Duplicate Tabs Closerであれば、ファイル名は `jid0-RvYT2rGWfM8q5yWxIxAHYAeo5Qg@jetpack.xpi` で、最終的なファイルのパスは `C:\Program Files\Mozilla Firefox\distribution\extensions\jid0-RvYT2rGWfM8q5yWxIxAHYAeo5Qg@jetpack.xpi` となります。
 4. ユーザ権限でFirefoxを起動します。それが初回起動であれば、アドオンが自動的にインストールされます。

この手順でインストールしたアドオンは以下の特徴を持ちます。

 * *既に存在しているユーザプロファイルでFirefoxを起動した場合、当該アドオンはインストールされません*。
   当該アドオンが自動的にインストールされるのは、あくまで、新規の導入時などで新しいプロファイルが作成された場合のみに限られます。
 * 当該アドオンは、ユーザが自分でインストールしたのと同じ扱いになります。
   * 当該アドオンはアドオンマネージャ上に表示されます。
   * *ユーザは当該アドオンを削除できます。*
   * *ユーザは当該アドオンを無効化できます。*
 * *当該アドオンは自動自動更新されます。*





# 複数バージョンの併用



## FirefoxやThunderbirdを別のプロファイルで同時に起動したい

キーワード：導入時初期設定

Firefox（およびThundebrird） 68以降のバージョンは、インストール先パスとユーザープロファイルが紐付く形となっており、インストール先パスを変えるだけで別プロファイルで同時に起動できるようになっています。

従来からあるプロファイルを明示的に指定して起動する方法によるプロファイルの使い分けについては、[株式会社クリアコードのブログに記載されている技術情報](https://www.clear-code.com/blog/2019/6/14.html)などを参照して下さい。



## 複数のバージョンのFirefoxやThunderbirdを併用し、同時に起動したい

キーワード：導入時初期設定

Firefox（およびThundebrird） 68以降のバージョンは、インストール先パスとユーザープロファイルが紐付く形となっており、インストール先パスを変えるだけで別プロファイルで同時に起動できるようになっています。

従来からあるプロファイルを明示的に指定して起動する方法によるプロファイルの使い分けについては、[株式会社クリアコードのブログに記載されている技術情報](https://www.clear-code.com/blog/2019/6/14.html)などを参照して下さい。





# 情報漏洩対策

## 社外サイトへアクセスする機能を全て無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxにはネットワーク上のサーバと連携する機能が多数含まれています。情報漏洩対策その他の理由から外部ネットワークへの意図しない通信を行わないようにしたい場合には、各機能を無効化することができます。

ただし、以下の設定は行動収集スクリプト（トラッキングスクリプト）のブロックのためのブロックリストを取得する動作も無効化します。
現在のWebでは行動収集スクリプトに起因する通信量が増大しており、Mozillaが提供するブロックリストを使用して通信を遮断した方が、結果的にバックグラウンドでの通信量が減る（ブロックリストの取得のための通信を無効化すると、通信量が却って増大する）という可能性も考えられます。
Firefox自体が行うバックグラウンドでの通信をどこまで無効化するかについては慎重に判断することが推奨されます。


### 設定方法

全ての外部向け通信を無効化するためには、[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)と、[MCD（AutoConfig）](#mcd)の両方を組み合わせる必要があります。
ポリシー定義ファイルの設定例は以下の通りです。

    {
      "policies": {
        "DisableAppUpdate": true,
        "ExtensionUpdate": false,
        "BlockAboutAddons": true,
        "InstallAddonsPermission": {
          "Default": false
        },
        "CaptivePortal": false,
        "SearchSuggestEnabled": false,
        "DisableTelemetry": true,
        "DisableFirefoxAccounts": true,
        "EnableTrackingProtection": {
          "Value": false,
          "Locked": true
        },
        "OverrideFirstRunPage": ""
      }
    }

MCD用設定ファイルの設定例は以下の通りです。

    // 攻撃サイトに対する警告の可否: しない
    lockPref("browser.safebrowsing.malware.enabled", false);
    lockPref("browser.safebrowsing.downloads.remote.url", "");
    lockPref("browser.safebrowsing.provider.google.advisoryURL", "");
    lockPref("browser.safebrowsing.provider.google.gethashURL", "");
    lockPref("browser.safebrowsing.provider.google.reportMalwareMistakeURL", "");
    lockPref("browser.safebrowsing.provider.google.reportPhishMistakeURL", "");
    lockPref("browser.safebrowsing.provider.google.reportURL", "");
    lockPref("browser.safebrowsing.provider.google.updateURL", "");
    lockPref("browser.safebrowsing.provider.google4.advisoryURL", "");
    lockPref("browser.safebrowsing.provider.google4.gethashURL", "");
    lockPref("browser.safebrowsing.provider.google4.reportMalwareMistakeURL", "");
    lockPref("browser.safebrowsing.provider.google4.reportPhishMistakeURL", "");
    lockPref("browser.safebrowsing.provider.google4.reportURL", "");
    lockPref("browser.safebrowsing.provider.google4.updateURL", "");
    lockPref("browser.safebrowsing.provider.mozilla.gethashURL", "");
    lockPref("browser.safebrowsing.provider.mozilla.updateURL", "");
    lockPref("browser.safebrowsing.reportMalwareMistakeURL", "");
    lockPref("browser.safebrowsing.reportPhishMistakeURL", "");
    lockPref("browser.safebrowsing.reportPhishURL", "");
    // ツールバーカスタマイズにおける、「その他のテーマを入手」の遷移の可否: 禁止する
    lockPref("lightweightThemes.getMoreURL", "");
    // ツールバーカスタマイズにおける、テーマの「おすすめ」の取得の可否: 禁止する
    lockPref("lightweightThemes.recommendedThemes", "");
    // 危険なアドオンとプラグインのブロックの可否: ブロックしない
    lockPref("extensions.blocklist.enabled", false);
    lockPref("extensions.blocklist.detailsURL", "");
    lockPref("extensions.blocklist.itemURL", "");
    lockPref("extensions.blocklist.url", "");
    // プロトコルごとの外部Webアプリケーションへの連携: 使用しない
    // Webフィード用のサービス
    lockPref("browser.contentHandlers.types.0.name", "");
    lockPref("browser.contentHandlers.types.0.uri", "");
    lockPref("browser.contentHandlers.types.1.name", "");
    lockPref("browser.contentHandlers.types.1.uri", "");
    pref("browser.contentHandlers.types.2.name", "");
    pref("browser.contentHandlers.types.2.uri", "");
    pref("browser.contentHandlers.types.3.name", "");
    pref("browser.contentHandlers.types.3.uri", "");
    pref("browser.contentHandlers.types.4.name", "");
    pref("browser.contentHandlers.types.4.uri", "");
    pref("browser.contentHandlers.types.5.name", "");
    pref("browser.contentHandlers.types.5.uri", "");
    // IRC
    lockPref("gecko.handlerService.schemes.irc.0.name", "");
    lockPref("gecko.handlerService.schemes.irc.0.uriTemplate", "");
    pref("gecko.handlerService.schemes.irc.1.name", "");
    pref("gecko.handlerService.schemes.irc.1.uriTemplate", "");
    pref("gecko.handlerService.schemes.irc.2.name", "");
    pref("gecko.handlerService.schemes.irc.2.uriTemplate", "");
    pref("gecko.handlerService.schemes.irc.3.name", "");
    pref("gecko.handlerService.schemes.irc.3.uriTemplate", "");
    lockPref("gecko.handlerService.schemes.ircs.0.name", "");
    lockPref("gecko.handlerService.schemes.ircs.0.uriTemplate", "");
    pref("gecko.handlerService.schemes.ircs.1.name", "");
    pref("gecko.handlerService.schemes.ircs.1.uriTemplate", "");
    pref("gecko.handlerService.schemes.ircs.2.name", "");
    pref("gecko.handlerService.schemes.ircs.2.uriTemplate", "");
    pref("gecko.handlerService.schemes.ircs.3.name", "");
    pref("gecko.handlerService.schemes.ircs.3.uriTemplate", "");
    // メール
    lockPref("gecko.handlerService.schemes.mailto.0.name", "");
    lockPref("gecko.handlerService.schemes.mailto.0.uriTemplate", "");
    lockPref("gecko.handlerService.schemes.mailto.1.name", "");
    lockPref("gecko.handlerService.schemes.mailto.1.uriTemplate", "");
    pref("gecko.handlerService.schemes.mailto.2.name", "");
    pref("gecko.handlerService.schemes.mailto.2.uriTemplate", "");
    pref("gecko.handlerService.schemes.mailto.3.name", "");
    pref("gecko.handlerService.schemes.mailto.3.uriTemplate", "");
    // カレンダー
    lockPref("gecko.handlerService.schemes.webcal.0.name", "");
    lockPref("gecko.handlerService.schemes.webcal.0.uriTemplate", "");
    pref("gecko.handlerService.schemes.webcal.1.name", "");
    pref("gecko.handlerService.schemes.webcal.1.uriTemplate", "");
    pref("gecko.handlerService.schemes.webcal.2.name", "");
    pref("gecko.handlerService.schemes.webcal.2.uriTemplate", "");
    pref("gecko.handlerService.schemes.webcal.3.name", "");
    pref("gecko.handlerService.schemes.webcal.3.uriTemplate", "");
    // ファイルのダウンロード保護により、危険なソフトウェアのインストールをブロックする: ブロックしない
    lockPref("browser.safebrowsing.downloads.enabled", false);
    // ファイルのダウンロード保護により、不要なソフトウェアのインストールの可能性がある場面で警告する: 警告しない
    lockPref("browser.safebrowsing.downloads.remote.block_potentially_unwanted", false);
    lockPref("browser.safebrowsing.downloads.remote.block_uncommon", false);
    // 危険ででしゃばりなFlashコンテンツをブロック: ブロックしない
    lockPref("plugins.flashBlock.enabled", false);
    // 過去にデータ流出事故を起こしたWebサービスでの警告の表示: 警告を表示しない
    lockPref("extensions.fxmonitor.enabled", false);
    // リンク先の先読みの可否: 禁止する
    lockPref("network.prefetch-next", false);
    // 検索結果のローカライズ用地域コードの位置情報に基づく推定の可否: 禁止する
    lockPref("browser.search.geoip.url", "");
    // Gecko Media Pluginの利用の可否: 禁止する
    lockPref("media.eme.enabled",false);
    lockPref("media.gmp-eme-adobe.enabled",false);
    lockPref("media.gmp-eme-adobe.autoupdate",false);
    lockPref("media.gmp-gmpopenh264.enabled",false);
    lockPref("media.gmp-gmpopenh264.autoupdate",false);
    lockPref("media.gmp-widevinecdm.enabled",false);
    lockPref("media.gmp-widevinecdm.autoupdate",false);
    lockPref("media.gmp-manager.url", "about:blank");
    lockPref("media.gmp-provider.enabled",false);
    // プラグインのブロック時などの詳細説明のURL
    lockPref("app.support.baseURL", "");
    // Webサイトの互換性情報のURL
    lockPref("breakpad.reportURL", "");
    // about:homeに表示するアドバイス情報の取得元URL
    lockPref("browser.aboutHomeSnippets.updateUrl", "");
    // オートコレクト用辞書の取得先URL
    lockPref("browser.dictionaries.download.url", "");
    // 位置情報サービスの説明用URL
    lockPref("browser.geolocation.warning.infoURL", "");
    // 地域ごとのデフォルトの検索サービス切り替え
    lockPref("browser.search.geoSpecificDefaults", false);
    lockPref("browser.search.geoSpecificDefaults.url", "");
    // 検索プロバイダ（検索エンジン）の取得元URL
    lockPref("browser.search.searchEnginesURL", "");
    // 接続の状態（接続が制限されているかどうかなど）を判定するためのアクセス先
    lockPref("captivedetect.canonicalURL", "");
    // Developer Editionの説明
    lockPref("devtools.devedition.promo.url", "");
    // 開発ツールで使用するデバイス
    lockPref("devtools.devices.url", "");
    // 開発者ツールからの外部サイト参照の無効化
    lockPref("devtools.gcli.imgurUploadURL", "");
    lockPref("devtools.gcli.jquerySrc", "");
    lockPref("devtools.gcli.lodashSrc", "");
    lockPref("devtools.gcli.underscoreSrc", "");
    lockPref("devtools.remote.adb.extensionURL", "");
    lockPref("devtools.webide.templatesURL", "");
    // 実験的機能の案内の無効化
    lockPref("experiments.manifest.uri", "");
    // パッチ、組み込みのアドオンの更新
    lockPref("extensions.systemAddon.update.url", "");
    // パッチ、組み込みのアドオンの更新
    lockPref("extensions.webservice.discoverURL", "");
    // 位置情報をWi-Fiアクセスポイントから取得するためのURL
    lockPref("geo.wifi.uri", "");
    // Firefox Accounts
    lockPref("identity.fxaccounts.remote.webchannel.uri", "");
    // Firefox Sync向けモバイルアプリの宣伝リンク
    lockPref("identity.mobilepromo.android", "");
    lockPref("identity.mobilepromo.ios", "");
    // トラッキング防止の案内
    lockPref("privacy.trackingprotection.introURL", "");
    // クラッシュレポーターの関連情報
    lockPref("toolkit.crashreporter.infoURL", "");
    // アドオンの署名義務化に関するメッセージ
    lockPref("xpinstall.signatures.devInfoURL", "");
    // IPv4, IPv6の疎通確認
    lockPref("network.connectivity-service.enabled", false);
    lockPref("network.connectivity-service.IPv4.url", "");
    lockPref("network.connectivity-service.IPv6.url", "");
    // DNSの疎通確認
    lockPref("network.connectivity-service.DNSv4.domain", "");
    lockPref("network.connectivity-service.DNSv6.domain", "");
    // ブロックリスト等の取得
    lockPref("services.settings.server", "localhost");




## クラッシュ時の情報を送信させたくない

キーワード：導入時初期設定、情報漏洩対策

FirefoxやThundebirdがクラッシュすると、通常はクラッシュレポーターが起動し、開発者達が問題を解決するための手がかりとしてクラッシュ時の詳しい情報をサーバに送信します。また、送信された情報は公開され、誰でも見ることができます。この仕組みによって機密情報が不用意に流出してしまわないように、クラッシュレポーター自体を無効化することができます。

### 送信される情報の内容

どのような情報がクラッシュレポートに付随して送信されるかは、[プライバシーポリシー](http://www.mozilla.jp/legal/privacy/firefox/)を参照して下さい。送信される内容には、例えば以下のような情報が含まれます。

 * Firefoxのバージョン、使用言語、使用テーマ、インストールされた日時、起動時間など
 * OSの種類、バージョン、メモリのサイズ、メモリの空き状況など
 * インストールされているアドオンのIDとバージョンの一覧
 * クラッシュ時の例外とスタックトレース

端的にいうと、場合によっては個人や組織の特定に繋がりうる情報が含まれることがあります。例えば組織内専用に開発したアドオンを使用している場合、そのアドオンのIDは送信される情報に含まれることとなります。

<!--
書きかけで断念した。
一言説明を書け次第復活する必要がある。

まず、クラッシュレポーターが送信する情報とはどのような物なのかを説明します。例として、[あるユーザがFirefox 26で遭遇したクラッシュについての情報](https://crash-stats.mozilla.com/report/index/a09f9beb-39e7-4706-8e5d-c0be92131222)を見ていきます。

リンク先のページはクラッシュ情報の詳細です。ここには以下の情報が記されています。

 * Signature：クラッシュの種類を識別する情報
 * UUID：このクラッシュ情報に付けられた一意なID
 * Date Processed：クラッシュ情報が送られた日時
 * Uptime：起動時間
 * Last Crash：前回のクラッシュからの経過時間
 * Install Age：Firefoxがインストールされてからの経過時間
 * Install Time：Firefoxがインストールされた日時
 * Product：クラッシュした製品（Firefox）
 * Version：Firefoxのバージョン
 * Build ID：Firefoxの詳細なバージョン
 * Release Channel：Firefoxの自動アップデート対象（リリース版、ベータ版など）
 * OS：OSの種類
 * OS Version：OSのバージョン
 * Build Architecture：実行ファイルのビルド対象アーキテクチャ
 * Build Architecture Info：実行ファイルのビルド対象アーキテクチャの詳細
 * Crash Reason：クラッシュの理由となった内部的な例外の名前
 * Crash Address：クラッシュしたメモリ上のアドレス
 * User Comments：クラッシュレポーター上でユーザが入力したコメント
 * App Notes：ビデオドライバのバージョン、Direct 3Dなどのハードウェアアクセラレーションの対応情報など
 * Processor Notes：クラッシュレポートの作成に使われたモジュールの情報
 * EMCheckCompatibility：アドオンマネージャでアドオンの互換性確認機能が有効になっているかどうか
 * Winsock LSP：Windowsの通信レイヤの詳細な情報
 * Adapter Vendor ID：ビデオカードのベンダを識別するID
 * Adapter Device ID：ビデオカードの種類を識別するID
 * Total Virtual Memory：仮想メモリの総サイズ
 * Available Virtual Memory：仮想メモリの利用可能サイズ
 * System Memory Use Percentage：システムのメモリの使用状況（パーセント）
 * Available Page File：利用可能なスワップファイルのサイズ
 * Available Physical Memory；利用可能な実メモリのサイズ
 * Add-ons：インストールされているアドオンのIDとバージョンの一覧

-->

### 設定方法

クラッシュレポーターの無効化は、通常の設定手順では行えず、環境変数の設定を必要とします。
環境変数 `MOZ_CRASHREPORTER_DISABLE ` を `1` に設定した状態では、Firefoxがクラッシュしてもクラッシュレポータは起動しません。




## 利用時の統計情報を送信させたくない

キーワード：導入時初期設定、情報漏洩対策

Firefoxには、利用時におけるメモリの使用状況などの性能に関する統計情報を収集してサーバに送信する機能が含まれています。この仕組みは初期状態で無効化されており、ユーザの確認の上で有効化されますが、最初から無効の状態に固定しておくことができます。

### 送信される情報の内容

どのような情報が統計情報として送信されるかは、[プライバシーポリシー](http://www.mozilla.jp/legal/privacy/firefox/#telemetry)を参照して下さい。個人や組織の特定に繋がりうる情報としては、統計情報に付随してIPアドレスが送信されます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`DisableTelemetry`](https://github.com/mozilla/policy-templates/blob/master/README.md#disabletelemetry) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "DisableTelemetry": true
      }
    }



## フォームのオートコンプリート機能を無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxのオートコンプリート機能（テキストボックスに入力した内容を保存しておき、次回以降の入力を省略する機能）は無効化することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`DisableFormHistory`](https://github.com/mozilla/policy-templates/blob/master/README.md#disableformhistory) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "DisableTelemetry": true
      }
    }

なお、この設定を反映しても、既に保存されている入力履歴の削除までは行われません。




## スマートロケーションバーを無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxのスマートロケーションバー機能（ロケーションバーから過去の閲覧履歴等を検索する機能）は無効化することができます。

### 設定方法

[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。

    // スマートロケーションバーのオートコンプリート機能の無効化
    lockPref("browser.urlbar.autocomplete.enabled", false);
    lockPref("browser.urlbar.maxRichResults", -1);
    lockPref("browser.urlbar.suggest.history", false);
    lockPref("browser.urlbar.suggest.bookmark", false);
    lockPref("browser.urlbar.suggest.openpage", false);
    lockPref("browser.urlbar.suggest.searches", false);

なお、この設定を反映しても、既に保存されている入力履歴や閲覧履歴の削除までは行われません（単に表示されなくなります）。





## パスワードを保存させたくない（パスワードマネージャを無効化したい）

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

FirefoxおよびThunderbirdのパスワードマネージャ機能は無効化することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`OfferToSaveLogins`](https://github.com/mozilla/policy-templates/blob/master/README.md#offertosavelogins) を `false` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "OfferToSaveLogins": false
      }
    }

なお、この設定を反映しても、既に保存されてしまっているパスワードの削除までは行われません。



## セッション機能を無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxのセッション関連機能はある程度まで無効化することができます。

### 設定方法

[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。

    lockPref("privacy.sanitize.sanitizeOnShutdown", true);
    lockPref("privacy.clearOnShutdown.sessions", true);
    lockPref("browser.sessionstore.max_tabs_undo", 0);
    lockPref("browser.sessionstore.max_windows_undo", 0);
    lockPref("browser.sessionstore.max_resumed_crashes", -1);
    lockPref("browser.sessionstore.max_serialize_back", 0);
    lockPref("browser.sessionstore.max_serialize_forward", 0);
    lockPref("browser.sessionstore.resume_from_crash", false);
    lockPref("browser.sessionstore.resume_session_once", false);
    lockPref("browser.sessionstore.privacy_level", 2);
    lockPref("browser.sessionstore.privacy_level_deferred", 2);
    // 3にすると前回セッションの復元となるので、それ以外を選択する。
    // 0: 空白ページ、1: ホームページ
    lockPref("browser.startup.page", 0);

この設定により、ディスク上に保存されるセッション情報は最小限の物となります。

### 注意事項

現在のバージョンのFirefoxでは、セッション管理機構自体を無効化することはできません。
上記の設定を行っても、タブで現在開いているページの情報だけはセッション情報に必ず保存されます。
また、閉じたウィンドウを開き直すためのデータもセッション中1つは必ず保持されます。




## 検索エンジン（Googleなど）の候補の推測表示を無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

FirefoxのWeb検索バーはGoogleなどの検索における検索語句の候補の表示に対応していますが、この機能は無効化することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`SearchSuggestEnabled`](https://github.com/mozilla/policy-templates/blob/master/README.md#searchsuggestenabled) を `false` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "SearchSuggestEnabled": false
      }
    }





## 位置情報取得API（Geolocation）を無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxは地図などのWebサービスに対して現在位置の情報を通知する機能を含んでいますが、この機能は無効化することができます。

### 設定方法

[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。

    lockPref("geo.enabled", false);




# ユーザが使える機能を制限したい



## 一部のキーボードショートカットを無効化したい {#disable-keyboard-shortcuts}

キーワード：機能制限、導入時初期設定、集中管理

現在のバージョンのFirefoxはキーボードショートカットを管理する機能を含んでいません。
ポリシー設定で機能を無効化する事によって、その機能に紐付くキーボードショートカットを無効化する事はできます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、対応する機能を無効化して下さい。例えば以下の要領です。

* ファイル＞新しいプライベートウィンドウを開く (Ctrl-Shift-P): [`DisablePrivateBrowsing`](https://github.com/mozilla/policy-templates/blob/master/README.md#disableprivatebrowsing) を `true` に設定
* ツール＞ウェブ開発（開発ツールボタン） およびその配下の機能: [`DisableDeveloperTools`](https://github.com/mozilla/policy-templates/blob/master/README.md#disabledevelopertools) を `true` に設定




## 一部のメニュー項目やツールバーボタンなどのUI要素を非表示にしたい {#hide-ui-elements}

キーワード：機能制限、導入時初期設定、集中管理

現在のバージョンのFirefoxは特定のUI要素の表示・非表示を管理する機能を原則として含んでいません。
ポリシー設定で機能を無効化する事によって、その機能に紐付くUIを無効化する事はできます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、対応する機能を無効化して下さい。例えば以下の要領です。

* ファイル＞新しいプライベートウィンドウを開く (Ctrl-Shift-P): [`DisablePrivateBrowsing`](https://github.com/mozilla/policy-templates/blob/master/README.md#disableprivatebrowsing) を `true` に設定
* ツール＞ウェブ開発（開発ツールボタン） およびその配下の機能: [`DisableDeveloperTools`](https://github.com/mozilla/policy-templates/blob/master/README.md#disabledevelopertools) を `true` に設定
* ヘルプ＞トラブルシューティング情報: [`BlockAboutSupport`](https://github.com/mozilla/policy-templates/blob/master/README.md#blockaboutsupport) を `true` に設定
* ヘルプ＞フィードバックを送信: [`DisableFeedbackCommands`](https://github.com/mozilla/policy-templates/blob/master/README.md#disablefeedbackcommands) を `true` に設定
* ヘルプ＞アドオンを無効にして再起動: [`DisableSafeMode`](https://github.com/mozilla/policy-templates/blob/master/README.md#disablesafemode) を `true` に設定
* コンテンツ領域のコンテキストメニュー＞デスクトップの背景に設定: [`DisableSetDesktopBackground`](https://github.com/mozilla/policy-templates/blob/master/README.md#disablesetdesktopbackground) を `true` に設定
* Firefox Sync: [`DisableFirefoxAccounts`](https://github.com/mozilla/policy-templates/blob/master/README.md#disablefirefoxaccounts) を `true` に設定
* Pocket: [`DisablePocket`](https://github.com/mozilla/policy-templates/blob/master/README.md#disablepocket) を `true` に設定



## プライベートブラウジング機能を使わせたくない

キーワード：機能制限、情報漏洩対策

プライベートブラウジング機能へのアクセス経路を無効化することで、ユーザのプライベートブラウジング機能の利用を禁止できます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`DisablePrivateBrowsing`](https://github.com/mozilla/policy-templates/blob/master/README.md#disableprivatebrowsing) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "DisablePrivateBrowsing": true
      }
    }




## Firefox Syncを使わせたくない

キーワード：機能制限、導入時初期設定、集中管理

無用なトラブルや情報の流出を避けるため、ユーザが任意にFirefox Syncをセットアップできないよう設定することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`DisableFirefoxAccounts`](https://github.com/mozilla/policy-templates/blob/master/README.md#disablefirefoxaccounts) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "DisableFirefoxAccounts": true
      }
    }




# 自動アップデート




## Firefox・Thunderbirdの自動アップデートを禁止したい

キーワード：機能制限、集中管理、自動アップデート

無用なトラブルを避けるため、ユーザが使用中にFirefoxやThunderbirdが自動アップデートを行わないよう設定することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`DisableAppUpdate`](https://github.com/mozilla/policy-templates/blob/master/README.md#disableappupdate) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "DisableAppUpdate": true
      }
    }


## Firefox・Thunderbirdの自動アップデートについて、メジャーアップデートは禁止し、マイナーアップデートのみ自動で適用したい

キーワード：機能制限、集中管理、自動アップデート

FirefoxやThunderbirdのESR版は通常、あるメジャーバージョンのサポートが終了すると、自動アップデート経由で次のメジャーバージョンにアップデートされます。例えばFirefox ESR68は、順次Firefox ESR78へアップデートされます。

このようなメジャーバージョンの変更を伴う自動アップデートの適用を禁止し、マイナーバージョンの変更のみを適用するには、組織内で提供する更新情報を参照するようにする必要があります。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`AppUpdateURL`](https://github.com/mozilla/policy-templates/blob/master/README.md#AppUpdateURL) を社内ホスト上のURLに設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "AppUpdateURL": "http://192.168.0.10/update.xml"
      }
    }

上記URLで提供する更新情報の内容の記述方法は次項を参照して下さい。


## Firefox・Thunderbirdの自動アップデートの提供タイミングを組織内で制御したい

キーワード：機能制限、集中管理、自動アップデート

通常、FirefoxやThunderbirdはMozillaが公式に提供しているアップデート情報に基づいて自動アップデートを行いますが、設定変更により、組織内のサーバなどをアップデート情報の提供元にすることができます。これにより、自動アップデートの適用タイミングを制御できます。

### 設定方法

<!--
    app.update.url に update.xml のURLを指定するばあい、ユーザー設定では反映されず、AutoConfigを使いdefaultPref/lockPrefで認識させる必要がある。
        URLには https: のみ利用できる。http:, ftp:, file:などは利用できない。
        http://mxr.mozilla.org/mozilla-central/source/toolkit/mozapps/update/nsUpdateService.js#3150
        ( http://mxr.mozilla.org/mozilla-esr17/source/toolkit/mozapps/update/nsUpdateService.js#2806 )
        http://mxr.mozilla.org/mozilla-central/source/toolkit/mozapps/shared/CertUtils.jsm#142
        ( http://mxr.mozilla.org/mozilla-esr17/source/toolkit/mozapps/shared/CertUtils.jsm#142 )
        ビルトインのルート証明書で検証できる証明書か、もしくは、独自の証明書が必要。独自の証明書を使う場合は app.update.cert.requireBuiltIn=false にする。
        それ以外は拒否されてしまう。
        update.xmlから指定するアップデート用ファイルのURLは、httpまたはhttpsでなければならない。
        http://mxr.mozilla.org/mozilla-esr17/source/netwerk/base/src/nsIncrementalDownload.cpp#503
        ローカルファイル、FTPなどは使えない。
    この方法は説明が煩雑なので紹介しない。
-->

Firefox ESR60.7.0（64bit版）が導入済みのクライアントをFirefox ESR68.0（64bit版）に更新するための情報およびファイルを静的なファイルとして提供する場合を例として、手順を説明します。

 1. アップデート用のアーカイブファイルをMozillaのリリースサーバから入手します。
    * リリースサーバ上には各バージョンのアップデート用差分ファイル、完全アップデート用アーカイブファイルが保存されており、以下のようなURLでダウンロードすることができます。
      [https://releases.mozilla.org/pub/firefox/releases/68.0esr/update/win64/ja/](https://releases.mozilla.org/pub/firefox/releases/68.0esr/update/win64/ja/)
    * ファイル名に `partial` と付いている物は差分アップデート用ファイル、`completet` と付いている物は完全アップデート用ファイルです。差分アップデート用ファイルはファイル名で示されている更新前バージョンに対してのみ適用できます。
 2. 1でダウンロードしたファイルを、自組織内からアクセスできるHTTPサーバ上に設置します。
    Sambaサーバ上のファイルにファイルとしてアクセスする形態や、ローカルのファイルシステムにマウントしてファイルとしてアクセスする形態では利用できず、あくまでHTTP経由でダウンロードできる状態にしておく必要があります。
 3. 以下のような内容で、自動アップデート情報提供用のXMLファイル `update.xml` を用意します。
    
        <?xml version="1.0"?>
        <updates>
          <update type="minor"
                  displayVersion="更新後バージョン番号の表示名"
                  appVersion="更新後バージョン番号"
                  platformVersion="更新後バージョン番号"
                  buildID="更新後バージョンのビルドID"
                  actions="silent">
            <patch type="complete"
                   URL="marファイルのダウンロード用URL"
                   hashFunction="ハッシュ関数の種類"
                   hashValue="marファイルのハッシュ"/>
          </update>
        </updates>
    
    例えばFirefox ESR68.0への更新で、ハッシュをSHA-512で用意するのあれば、以下のようになります。
    
        <?xml version="1.0"?>
        <updates>
          <update type="minor"
                  displayVersion="68.0esr"
                  appVersion="68.0"
                  platformVersion="68.0"
                  buildID="about:supportで確認できるビルドID"
                  actions="silent">
            <patch type="complete"
                   URL="marファイルのダウンロード用URL"
                   hashFunction="SHA512"
                   hashValue="marファイルのSHA-512ハッシュ"/>
          </update>
        </updates>
    
 4. 3で用意したファイルをクライアント上のローカルファイル、ファイル共有サーバ上のファイル、HTTPサーバ上のファイルのいずれかの形で設置し、クライアントから取得できるようにします。
 5. [グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`AppUpdateURL`](https://github.com/mozilla/policy-templates/blob/master/README.md#AppUpdateURL) を4で設置したファイルのURL文字列に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "AppUpdateURL": "http://192.168.0.10/update.xml"
      }
    }

以上で更新情報の提供準備ならびにクライアントの設定は完了です。以後は、サーバ上に設置した `update.xml` ならびにアップデート用のアーカイブファイルを適宜更新するようにして下さい。

詳細な情報は[更新サーバの設定 - Mozilla | MDN](https://developer.mozilla.org/ja/docs/Mozilla/Setting_up_an_update_server)を参照して下さい。

### 確認方法

以下の通り設定を変更すると、自動アップデートの処理が10秒ごとに行われるようになります。この状態で `エラーコンソール` もしくは `ブラウザコンソール` を表示すると、自動アップデート処理の詳細なログが表示されます。更新情報の取得に成功しているかどうか、取得した更新情報の読み込みに成功しているかどうかなどを確認するのに利用できます。

 * `app.update.timerMinimumDelay`（整数）：`10`
 * `app.update.promptWaitTime`（整数）：`1`
 * `app.update.interval`（整数）：`10`
 * `app.update.log`（真偽）：`true`
 * `app.update.log.all`（真偽）：`true`

### 注意事項

上記手順での設定後は、SSLを使用しない限り、更新情報の提供元自体が正しいかどうか（中間者攻撃を受けていないかどうか）の検証は行われない状態となります。信頼できないネットワークを経由する場合は、SSLを使って安全に更新情報を取得できるようにして下さい。




## 自動アップデート機能を使わずにFirefox/Thunderbirdを差分更新したい

キーワード：自動アップデート

FirefoxやThunderbirdの自動アップデート機能は、通常のインストーラよりも遙かに小さい差分ファイルをダウンロードしてアプリケーションを更新するようになっています。
この差分更新用のファイルを使った差分更新処理は、自動アップデート機能を使わずとも、任意のタイミングで実行することができます。
これにより、自動アップデート機能自体は無効にしておきつつ、必要に応じてシステムのログオンスクリプトを使って任意のタイミングでの差分更新を適用する、という形での運用が可能です。

###　差分ファイルの入手

差分アップデートの適用時には、アップデート用差分ファイルを公式のFTPサイトから入手する必要があります。
URLの凡例は以下の通りです。

    Windows用64bit版：
    https://releases.mozilla.org/pub/mozilla.org/[製品名]/releases/[アップデート先バージョン]/update/win64/ja/[製品名]-[アップデート元バージョン]-[アップデート先バージョン].partial.mar
    Windows用32bit版：
    https://releases.mozilla.org/pub/mozilla.org/[製品名]/releases/[アップデート先バージョン]/update/win32/ja/[製品名]-[アップデート元バージョン]-[アップデート先バージョン].partial.mar

例えばFirefox ESR68.0（64bit版）からESR68.1.0（64bit版）へアップデートする場合に必要な差分ファイルは以下の場所から入手できます。 

    https://releases.mozilla.org/pub/firefox/releases/68.1.0esr/update/win64/ja/firefox-68.0esr-68.1.0esr.partial.mar 

差分ファイルによるアップデートを行うには、現在インストールされているFirefoxのバージョンに対応した差分ファイルが必要となります。
差分ファイルが想定する「アップデート前のバージョン」が現在インストールされているFirefoxのバージョンに一致しない場合、差分アップデートは行えません。

通常、公式のFTPサイトでは特定バージョンのFirefoxに対して、それ以前のいくつかのバージョンからの差分アップデート用のファイルのみが配布されています。
差分ファイルが用意されていないパターン、例えばFirefox ESR60.0からESR68.0へアップデートするというような、間のバージョンを多数飛ばしたアップデートは原則として行えないものとご理解下さい。

### 差分更新の適用手順の凡例

Firefoxの差分更新用ファイルを用いて際の手順は以下の通りです。 

 1. 管理者権限でコマンドプロンプトを起動する。
    Windows XPの場合、Administrator権限のあるユーザで
    コマンドプロンプトを起動する。
    Windows Vista以降の場合、スタートメニューの
    「すべてのプログラム」→「アクセサリ」→「コマンド プロンプト」を
    右クリックして「管理者として実行」を選択する。
   
 2. 先の方法で入手した差分アップデート用のファイル
    （firefox-*-*.partial.mar）を作業ディレクトリに
    「update.mar」というファイル名で配置する。
    
        > copy firefox-*.partial.mar "<作業ディレクトリのパス>\update.mar"
    
 3. Firefoxのインストール先フォルダにあるupdater.exe を
    作業ディレクトリにコピーする。
    
        > copy "<Firefoxのインストール先フォルダのパス>\updater.exe"
            "<作業ディレクトリのパス>\updater.exe" 
    
 4. 作業ディレクトリに配置したupdater.exeを、
    差分アップデート用のファイルがあるディレクトリ（ここでは作業ディレクトリと同じ）のフルパスを第1引数、
    Firefoxのインストール先フォルダのフルパスを第2引数、updater.exeが動作する際の作業フォルダのパス
    （＝Firefoxのインストール先フォルダ）のフルパスを第3引数して渡して起動する。

        > cd "<作業ディレクトリのパス>"
        > "<作業ディレクトリのパス>\updater.exe" "<差分アップデート用のファイルがあるディレクトリのフルパス>" "<Firefoxのインストール先フォルダのフルパス>" "<Firefoxのインストール先フォルダのフルパス>"
    
 5. アップデートの適用結果を確認する。
    作業ディレクトリに出力された update.status の内容が
    「succeeded」であれば、アップデートに成功している。
    そうでない場合は、アップデートの適用に失敗している。
    
 6. アンインストール情報を更新する。
    update.log をFirefoxのインストール先フォルダの「uninstall」フォルダ内に、「uninstall.update」というファイル名でコピーする。
    
        > copy /Y update.log "<Firefoxのインストール先フォルダのパス>\uninstall\uinstall.update"
    
 7. アップデートの後処理を実行する。
    Firefoxのインストール先フォルダの「uninstall」フォルダにあるhelper.exe を、「/PostUpdate」オプションを指定して実行する。
    
        > "<Firefoxのインストール先フォルダのパス>\uninstall\helper.exe" /PostUpdate
    
    これにより、レジストリ内のFirefoxのバージョンなどの情報が更新される。

以上で、差分アップデートの適用は完了です。


### 差分更新の適用例

本項では、例として以下のバージョンにおける差分更新の適用時の具体的な手順を示します。

 * 現在Firefox ESR68.0がインストールされている。
 * Firefox ESR68.1.0へアップデートする。
 * 作業ディレクトリは C:\temp とする。 
 * Firefoxのインストール先は
   C:\Program Files\Mozilla Firefox とする。

 1. 管理者権限でコマンドプロンプトを起動する。
 2. 差分アップデート用のファイルを作業ディレクトリに
    update.marというファイル名で配置する。
    
        > copy firefox-68.0esr-68.1.0esr.partial.mar "C:\temp\update.mar"
    
 3. Firefoxのインストール先フォルダにあるupdater.exe を
    作業ディレクトリにコピーする。
    
        > copy "C:\Program Files\Mozilla Firefox\updater.exe"
          "C:\temp\updater.exe"
    
 4. 作業ディレクトリに配置したupdater.exeを、
    作業ディレクトリのフルパスを第1引数、
    Firefoxのインストール先フォルダのフルパスを第2引数と第3引数として渡して
    起動する。
    
        > cd c:\temp
        > updater.exe "C:\temp" "C:\Program Files\Mozilla Firefox" "C:\Program Files\Mozilla Firefox"
    
 5. アップデートの適用結果を確認する。
    
        > type update.status


以上で、差分アップデートの適用は完了です。



## アドオンの自動アップデートの提供タイミングを組織内で制御したい

キーワード：機能制限、集中管理、自動アップデート、アドオン

通常、FirefoxやThunderbirdはMozillaが公式に提供しているアドオンのアップデート情報に基づいてアドオンの自動アップデートを行いますが、設定変更により、組織内のサーバなどをアップデート情報の提供元にすることができます。これにより、アドオンの自動アップデートの適用タイミングを制御できます。

### 設定方法

 1. 以下のような内容で、自動アップデート情報提供用のJSONファイル `update.json` を用意します。
    
        {
          "addons": {
            "アドオンのID": {
              "updates": [
                {
                  "version": "アドオンのバージョン",
                  "update_link": "XPIファイルのダウンロード用URL",
                  "update_hash": "ハッシュ関数名:XPIファイルのハッシュ値"
                  "browser_specific_settings": {
                    "gecko": { "strict_min_version": "対応するFirefoxの最小バージョン" }
                  }
                }
              ]
            }
          }
        }
    
    例えば[Duplicate Tabs Closer][]の更新情報を提供するのであれば以下のようになります。
    
        {
          "addons": {
            "jid0-RvYT2rGWfM8q5yWxIxAHYAeo5Qg@jetpack": {
              "updates": [
                {
                  "version": "3.4.1",
                  "update_link": "http://192.168.0.10/duplicate_tabs_closer-3.4.1-fx.xpi",
                  "update_hash": "sha256:a952bbcef93fbd0d5e2278265824fc270c356bbabe91c79ef3245f7419d9f02c"
                  "browser_specific_settings": {
                    "gecko": { "strict_min_version": "55.0" }
                  }
                }
              ]
            }
          }
        }
    
 2. 1で用意したファイルをクライアント上のローカルファイル、ファイル共有サーバ上のファイル、HTTPサーバ上のファイルのいずれかの形で設置し、クライアントから取得できるようにします。
 3. [MCD（AutoConfig）](#mcd)を使って、文字列型の設定 `extensions.update.url` の値に、2で設置したファイルのURL文字列を指定します。

以上で更新情報の提供準備ならびにクライアントの設定は完了です。以後は、サーバ上に設置した `update.json` ならびに各アドオンのXPIファイルを適宜更新するようにして下さい。

詳細な情報は[Updating your extension | Extension Workshop](https://extensionworkshop.com/documentation/manage/updating-your-extension/)を参照して下さい。

### 確認方法

以下の通り設定を変更すると、アドオンの自動アップデートの処理が10秒ごとに行われるようになります。この状態で `エラーコンソール` もしくは `ブラウザコンソール` を表示すると、自動アップデート処理の詳細なログが表示されます。更新情報の取得に成功しているかどうか、取得した更新情報の読み込みに成功しているかどうかなどを確認するのに利用できます。

 * `app.update.timerMinimumDelay`（整数）：`10`
 * `extensions.update.interval`（整数）：`10`
 * `extensions.logging.enabled`（真偽）：`true`

### 注意事項

上記手順での設定後は、SSLを使用しない限り、更新情報の提供元自体が正しいかどうか（中間者攻撃を受けていないかどうか）の検証は行われない状態となります。信頼できないネットワークを経由する場合は、SSLを使って安全に更新情報を取得できるようにして下さい。






# ユーザを惑わすメッセージを表示させたくない




## 初回起動時の設定移行ウィザードを表示させたくない

キーワード：導入時初期設定

FirefoxやThundebirdの初回起動時に表示される `設定移行ウィザード` （他のアプリケーションの設定を引き継ぐためのウィザード）は無効化することができます。

### 設定方法

`override.ini` という名前で以下の内容のテキストファイルを作成し、Firefoxであればインストール先ディレクトリ内の `browser` ディレクトリ内（Windowsであれば、`C:\Program Files\Mozilla Firefox\browser\override.ini` など）、Thunderbirdであればインストール先ディレクトリ直下（Windowsであれば、`C:\Program Files\Mozilla Thunderbird\override.ini` など）に置きます。

    [XRE]
    EnableProfileMigrator=0




## アップデート後の「お使いのFirefoxは最新版に更新されました」タブを表示させたくない

キーワード：導入時初期設定

Firefoxを更新した後の初回起動時に表示される「お使いのFirefoxは最新版に更新されました」タブは、設定で無効化することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`OverridePostUpdatePage`](https://github.com/mozilla/policy-templates/blob/master/README.md#overridepostupdatepage) を空文字に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "OverridePostUpdatePage": ""
      }
    }





## アップデート後の「Thunderbirdへようこそ」（新着情報）タブを表示させたくない

キーワード：導入時初期設定

Thunderbirdを更新した後の初回起動時に表示される「Thunderbirdへようこそ」タブは、設定で無効化することができます。

### 設定方法

[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。

    clearPref("app.update.postupdate");

上記の設定は、設定値の内容に関わらず、ユーザ設定値が保存されていると「Thunderbirdへようこそ」タブが開かれるという仕様になっています。そのため、明示的に `false` を指定する代わりにユーザ設定値を消去する必要があります。



## パフォーマンス情報の自動送信に関するメッセージを表示させたくない

キーワード：導入時初期設定

FirefoxやThunderbirdの初回起動時などに表示される「Mozilla Firefox（Thunderbird）の改善のため、メモリ消費量、パフォーマンス、応答速度を自動的にMozillaに送信しますか？」のメッセージは、設定で無効化することができます。

### 設定方法

[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。設定名はFirefoxとThunderbirdで共通です。

    if (typeof getPref("toolkit.telemetry.prompted") == "boolean")
      clearPref("toolkit.telemetry.prompted");
    lockPref("toolkit.telemetry.prompted", 2);

上記のメッセージが表示された際に「いいえ」を選択した状態にしたい場合（パフォーマンス情報の自動送信を禁止したい場合）は、以下も併せて指定します。

    lockPref("toolkit.telemetry.enabled", false);
    lockPref("toolkit.telemetry.rejected", true);



<!--
## ダウンロード完了の通知を表示させたくない（未稿）
  autoconfig
旧ダウンロードマネージャが廃止されたので、これはこのままでは書けない気がする。
何のために通知を表示させたくないのか、ということを汲み取って、新しいUIでその目的を達成するためのカスタマイズを考える必要がある。
-->





## タブを閉じようとしたときの警告を表示させたくない

キーワード：導入時初期設定

Firefoxでウィンドウや複数のタブを一度に閉じようとした時に表示される、本当に閉じてもよいかどうかの確認ダイアログは、設定で無効化することができます。

### 設定方法

[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。

    // 複数のタブを開いた状態でウィンドウを閉じようとした時の確認を表示しない
    lockPref("browser.tabs.warnOnClose", false);
    // 「他のタブを閉じる」で複数のタブを一度に閉じようとした時の確認を表示しない
    lockPref("browser.tabs.warnOnCloseOtherTabs", false);







# 初期設定の変更




## 既定のホームページを変更したい

キーワード：導入時初期設定

Firefoxを起動した時に表示される最初のページはユーザが自由に変更できますが、変更するまでの間は初期設定が使われ、また、`初期設定に戻す` で最初の状態に戻すことができます。この時の初期設定として使われるページは変更することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`Homepage.URL`](https://github.com/mozilla/policy-templates/blob/master/README.md#homepage) を設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "Homepage": {
          "URL": "http://example.com",
          "Locked": false
        }
      }
    }

ユーザーによる設定の変更を禁止する場合は以下のようにして下さい。

    {
      "policies": {
        "Homepage": {
          "URL": "http://example.com",
          "Locked": true
        }
      }
    }

また、単一のタブではなく複数のタブをホームページとして開く場合は以下のようにして下さい。

    {
      "policies": {
        "Homepage": {
          "URL": "http://example.com",
          "Locked": true,
          "Additional": [
            "https://example.org:8080",
            "https://example.jp:8080"
          ]
        }
      }
    }




## 初期状態のブックマークの内容を変更したい

キーワード：導入時初期設定、ブックマーク

Firefoxの初期状態のブックマークの内容は、変更することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`Bookmarks`](https://github.com/mozilla/policy-templates/blob/master/README.md#bookmarks) を設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "Bookmarks": [
          {
            "Title": "ブックマークツールバー上に作成する項目",
            "URL": "https://example.com/toolbar",
            "Favicon": "https://example.com/favicon.ico",
            "Placement": "toolbar",
            "Folder": "フォルダー名"
          },
          {
            "Title": "ブックマークメニューに作成する項目",
            "URL": "https://example.com/menu",
            "Favicon": "https://example.com/favicon.ico",
            "Placement": "menu",
            "Folder": "フォルダー名"
          }
        ]
      }
    }

## ブックマークを初期状態で空にしたい

キーワード：導入時初期設定、ブックマーク

Firefoxの初期状態で含まれているブックマーク項目は、空にすることができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`NoDefaultBookmarks`](https://github.com/mozilla/policy-templates/blob/master/README.md#nodefaultbookmarks) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "NoDefaultBookmarks": true
      }
    }


## ブックマークツールバーを初期状態で表示したい

キーワード：導入時初期設定、ブックマーク

Firefoxの初期状態ではブックマークツールバーは非表示ですが、表示状態にしておくことができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`DisplayBookmarksToolbar`](https://github.com/mozilla/policy-templates/blob/master/README.md#displaybookmarkstoolbar) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "DisplayBookmarksToolbar": true
      }
    }



## プロキシの設定を固定・強制したい

キーワード：導入時初期設定、機能制限

Firefoxのネットワーク設定において、プロキシの使用を強制することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`Proxy`](https://github.com/mozilla/policy-templates/blob/master/README.md#proxy) 配下の設定を適切に設定して下さい。

特定のHTTPプロキシの使用を強制する場合は以下のように設定します。

    {
      "policies": {
        "Proxy": {
          "Mode": "manual",
          "Locked": true,
          "HTTPProxy": "proxy.hostname:8080",
          "UseHTTPProxyForAllProtocols": true
        }
      }
    }

自動設定スクリプト（PACファイル）の使用を強制する場合は以下のように設定します。

    {
      "policies": {
        "Proxy": {
          "Mode": "autoConfig",
          "Locked": true,
          "AutoConfigURL": "http://internal-server/proxy.pac"
        }
      }
    }



## プロキシを使用しない例外サイト（ドメイン）を指定したい

キーワード：導入時初期設定

Firefoxは、プロキシを使用しない例外サイトを設定する機能を持っています。

### 設定方法

[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。対象ホスト名はカンマ区切りで複数指定できます。

    lockPref("network.proxy.no_proxies_on", "localhost, .example.org");



## 履歴を保存させたくない

キーワード：導入時初期設定、機能制限

FirefoxでのWebページの閲覧履歴について、一切の履歴を保存しないように設定することができます。

### 設定方法

[グループポリシー](#group-policy)または[ポリシー定義ファイル](#policies-json)を用いて、[`SanitizeOnShutdown`](https://github.com/mozilla/policy-templates/blob/master/README.md#sanitizeonshutdown-selective) を `true` に設定して下さい。例えば以下の要領です。

    {
      "policies": {
        "SanitizeOnShutdown": true
      }
    }

この設定を行うと、Cookieやフォームの入力、サイトごとの設定なども全て消去されます。各項目を消去するかどうかを個別に変更したい場合、以下のように消去した物のみ `true` と設定して下さい。

    {
      "policies": {
        "SanitizeOnShutdown": {
          "Cache": true,
          "Cookies": false,
          "Downloads": true,
          "FormData": false,
          "History": true,
          "Sessions": true,
          "SiteSettings": false,
          "OfflineApps": true
        }
      }
    }



## 一定以上の日数が経過した履歴を自動的に消去したい

キーワード：導入時初期設定、機能制限

現在のバージョンのFirefoxは、一定以上の日数が経過した履歴を自動的に消去する機能を持っていません。
アドオンを使用する事で、古い履歴を自動的に消去させることができます。

### 設定方法

日数ベースでの履歴の管理機能をFirefoxに導入する方法としては、アドオン [Expire history by days](https://addons.mozilla.org/firefox/addon/expire-history-by-days/)の利用が挙げられます。
例えば、Expire history by daysを使って履歴の有効期限を30日に設定する場合の手順は以下の通りです。

 1. [管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従い、Expire history by daysを導入します。
 2. [MCD（AutoConfig）](#mcd)を使い、以下の通り設定します。
    
        lockPref("extensions.bonardonet.expire-history-by-days.days", 30);






## サイトごとの機能の許可をあらかじめ設定しておきたい（位置情報の取得の可否、アドオンのインストールの可否など）

キーワード：導入時初期設定

Firefoxには、Cookieや位置情報などのWebページから利用できる様々な機能について、機能の許可をWebサイトごとに管理する仕組みが備わっています。既に保存されている設定については、`about:permissions`（サイト別設定マネージャ）で設定の変更や消去が可能です。

アドオンを使うことによって、これらのサイト別設定を管理者が任意の状態に設定することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck)を使用すると、サイトごとの機能の利用許可を行うアドオンを作成することができます。

### より詳細な設定を伴う実現方法

サイト別設定を管理者が詳細に管理する方法として、アドオン [Permissions Auto Registerer](https://addons.mozilla.org/firefox/addon/permissions-auto-registerer/)の利用が挙げられます。
例えば、Permissions Auto Registererを使って `www.example.com` に対しサイト別設定の全項目を「禁止」と設定する場合の手順は以下の通りです。

 1. [管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってPermissions Auto Registererを導入します。
 2. [MCD（AutoConfig）](#mcd)を使い、以下の通り設定します。
    
        lockPref("extensions.autopermission.sites.www.example.com", "password=2, geo=2, cookie=2, popup=2, indexedDB=2, fullscreen=2, image=2, install=2, offline-app=2");

設定名はサイト別設定を指定するサイトのドメイン名を含めて `extensions.autopermission.sites.<ドメイン名>` とします。設定値は、1つ以上の設定項目についてキーと値を `=` で繋げたリストをカンマ区切りで列挙した文字列で指定します。指定可能な設定項目は以下の通りです。

 * `password`：パスワードを保存する。
 * `geo`：位置情報を取得する。
 * `cookie`：Cookieを保存する。
 * `popup`：ポップアップウィンドウを開く。
 * `indexedDB`：オフラインストレージを利用する。
 * `fullscreen`：DOMフルスクリーンAPIを利用する。
 * `image`：画像を読み込む。
 * `install`：アドオンのインストールを許可する。
 * `offline-app`：オフラインアプリケーション用のキャッシュの利用を許可する。

また、個々の項目の値は以下のいずれかを取ります。

 * `0`：不明。どうするかはユーザに尋ねる。
 * `1`：許可する。
 * `2`：禁止する。

また、[CCK2 Wizard](#cck)でも機能の利用を許可するドメインの指定が可能です。






## ロケーションバーで常に「http://」を表示させたい

キーワード：導入時初期設定

Firefoxのロケーションバーでは通常、URL文字列の先頭の「http://」は省略して表示されますが、これを常に表示するように設定することができます。

### 設定方法

[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。

    lockPref("browser.urlbar.trimURLs", false);





## 独自SSL証明書やルート証明書をあらかじめ登録済みの状態にしたい

キーワード：導入時初期設定

Firefoxにあらかじめ登録されている物以外の証明局によって署名された証明書（いわゆる自己署名証明書など）を使ったWebサイトにSSLで接続すると、Firefoxは不明な証明書として警告を表示します。それらの証明書を別途安全な手段で提供できるのであれば、証明書をFirefoxにあらかじめ登録しておくことで、警告画面を見ずにWebサイトを利用することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck)を使用すると、任意の証明書を自動登録するアドオンを作成することができます。

### より詳細な設定を伴う実現方法

証明書を管理者があらかじめ登録しておく別の方法としては、アドオン [Cert Importer][]の利用が挙げられます。
例えば、Cert Importerを使ってルート証明書 `myCA.crt` を登録する場合の手順は以下の通りです。

 1. [管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってPermissions Auto Registererを導入します。
 2. Firefoxの実行ファイルと同じ位置にある `defaults` フォルダに `myCA.crt` を置きます。
    Firefoxが `C:\Program Files\Mozilla Firefox` にインストールされている場合、最終的なファイルのパスは `C:\Program Files\Mozilla Firefox\defaults\myCA.crt` となります。

以上で設定は完了です。Firefoxの次回起動時にアドオンがファイルを自動認識し、証明書に設定されたフラグに従って証明書の登録を行います。Firefoxのオプション画面で `詳細`→`証明書`→`証明書を表示`と辿り、証明書が正しく登録されているかどうかを確認して下さい。

また、[CCK2 Wizard](#cck)でも機能の利用を許可するドメインの指定が可能です。

#### 証明書の種類を正しく認識しない場合

Cert Importerが証明書自身に設定されたフラグを正しく認識できなかった場合、ルート証明書がSSLのサイト証明書として登録されるといった結果になることがあります。このような場合は、設定を用いて強制的に証明書の種類を上書き指定することができます。[MCD（AutoConfig）](#mcd)を用いて以下の通り設定して下さい。

    defaultPref("extensions.certimporter.certs.myCA.crt", 1);

証明書の種類を指定する設定の名前は `extensions.certimporter.certs.<ファイル名>` とし、値は以下の整数値の1つ以上の和を指定します。

 * `1`：ルート証明書。
 * `2`：ユーザー証明書。
 * `4`：E-mail証明書。
 * `8`：SSLサイト証明書。

#### SSLのセキュリティ例外の自動登録

Cert Importerは、SSLのセキュリティ例外について、特定のホストを対象に設定する事もできます。詳細は[Cert Importer][]の説明文を参照して下さい。




# その他便利な機能




## IMAPフォルダのローカルコピーを一切残させたくない

キーワード：機能制限、情報漏洩対策

ThunderbirdはIMAPサーバを使用するメールアカウントについて、メールの本文をダウンロードせずヘッダ情報だけをダウンロードする設定が可能です。
しかしながら、ヘッダ情報はローカルに保存される上、一度表示したメールについては本文のデータもディスクキャッシュ上に保存されるため、情報漏洩対策としてIMAPを使用するという場合には、その設定だけでは目的を十分には達成できません。

アドオン [IMAPキャッシュの自動消去（Clear IMAP Cache）][]を導入すると、Thunderbirdを終了する度にダウンロード済みのヘッダ情報とディスクキャッシュを自動的に消去させることができます。
これによって、情報漏洩対策としての実効性をより高めることができます。

### 注意事項

このアドオンを使うことで完全な情報漏洩対策が実現される、というわけではないことに注意して下さい。
例えば、ヘッダ情報が保存されているファイルが使用中の場合には、このアドオンではヘッダ情報が消去されない場合があります。




## Outlookとの連携時にwinmail.datを簡単に開けるようにしたい

キーワード：アプリケーション連携

Outlookから送信したメールには、`winmail.dat` というファイルが添付されている場合があります。
このファイルにはリッチテキスト形式の本文が保存されていますが、Thunderbirdでは内容を閲覧することができません。
そのため、添付されたwinmail.datをダブルクリック等で開こうとした場合には、ファイルが開かれるのではなくファイルのダウンロード（ファイルとして保存する処理）が開始されます。

`winmail.datの内容` は、[WinmailOpener][]という別のソフトウェアで閲覧することができます。
アドオン [Winmail Opener Bridge][]を導入すると、添付された `winmail.dat` を開こうとした時に自動的にWinmailOpenerでファイルが開かれるようになります。

### 注意事項

Winmail Opener BridgeにはWinmailOpenerは同梱されていません。利用にあたっては、別途WinmailOpenerをインストールしておく必要があります。




## メールアカウント作成ウィザードで特定組織向けのメールアカウントをもっと簡単に作成させたい

キーワード：導入時初期設定

Thunderbirdのメールアカウント作成ウィザードでは、Mozilla公式に提供されているISPの情報や、メールサーバに設置された設定情報、一般的なメールサーバの設定の流儀などに従って、メールアドレスとパスワードを入力するだけでメールアカウントを半自動的に作成することができます。
しかしながら、メールサーバなどの基本的な設定以外の項目（例えばHTMLメールの利用の可否など）は、その後改めて手動で設定する必要があります。

アドオン [AutoConfiguration Hook][]を使用すると、あらかじめメールアカウント情報のテンプレートとなる設定ファイルを用意しておくことにより、基本設定以外の項目についてもメールアカウント作成時の初期値を指定することができます。
また、メールアドレスのローカルパートのみを入力させてメールアカウントを作成できる、特定組織向けのメールアカウント作成専用のウィザードも利用可能になります。





## メールアドレス入力欄の2番目以降に不正なアドレスが入力されているときに警告のメッセージを出したい

キーワード：障害回避

Thunderbirdは、メールの宛先が正しいメールアドレスでない場合、メール送信時に警告が表示される仕様になっています。
しかしながら、2つ目以降の宛先についてはこの確認が行われないという不具合（制限事項）があります。

アドオン [不正なアドレスの警告表示パッチ（Patch to Alert Invalid Addresses）][]を使用すると、2つ目以降の宛先についても最初の宛先と同様の妥当性検証が行われるようになります。





## ローカルファイルに対するリンクをメール本文中に挿入したい

キーワード：利便性向上

古いバージョンのThunderbirdでは、メール編集ウィンドウの本文領域にファイルをドラッグ＆ドロップすると、ファイルのURL文字列がその位置に挿入される仕様でした。
しかしながら、現在のバージョンのThunderbirdでは、この機能は廃止されています。

アドオン [ローカルファイルからのリンク挿入（Insert Link from Local File）][]を導入すると、古いバージョンのThunderbirdと同様に、ファイルのドロップ位置にそのファイルのURLを挿入できるようになります。
挿入されたURLは、受信者側ではリンクとして利用することができます。

これによって、社内でのメールのやりとりにおいて、ファイルを添付する代わりに共有フォルダに置きURLだけをやりとりする、といった使い方が容易になります。





## Windowsのショートカットを添付できるようにしたい、添付されたWinodwsのショートカットを直接実行したい

キーワード：利便性向上

Thunderbirdでは、Windowsのショートカットファイルをメールに添付することができません。
また、添付されたショートカットファイルを受信した場合にも、それを直接開くことはできず、一旦ファイルとして保存してから改めて開く必要があります。

アドオン [Windowsショートカットの直接実行（Open Windows Shortcuts Directly）][]を導入すると、ショートカットをメール編集ウィンドウの宛先領域周辺にドラッグ＆ドロップすることによってファイルとしてそのまま添付できるようになります（※メニューからの操作でコモンダイアログから選択した場合は、ショートカットのリンク先の実体ファイルが添付されます）。
また、ショートカットが添付されたメールについては、ショートカットをダブルクリックするなどの操作によりリンク先の実体ファイルを直接開けるようになります。

これによって、社内でのメールのやりとりにおいて、ファイルを添付する代わりに共有フォルダに置きショートカットだけをやりとりする、といった使い方が容易になります。






## 添付ファイルの文字エンコーディングの自動判別をより賢くしたい

キーワード：利便性向上

Thunderbirdでは、プレーンテキスト形式のファイルを添付する際にファイルの文字エンコーディングを自動判別し、ヘッダ情報に含めるようになっています。
しかしながら、この自動判別があまり正確でないため、Shift_JISやEUC-JPのテキストファイルを添付した場合に受信者側で文字化けして表示される事があります。

アドオン [添付ファイルの文字エンコーディングの自動判別（Attachemnt Encoding Detector）][]を導入することにより、上記処理における文字エンコーディングの自動判別において言語別の自動判別器が使われるようになり、文字化けの発生を低減することができます。




## アドレス帳を複数コンピュータ間で同期したい

キーワード：利便性向上

Thunderbirdでは、LDAPアドレス帳機能によって、ディレクトリサーバ内に格納されている情報をアドレス帳として参照することができます。
しかしながら、この機能にはいくつかの制限事項があります。

 * LDAPアドレス帳への書き込みはできません。読み込みのみの利用となります。
 * ディレクトリサーバに接続する際のユーザをWindowsのログオンユーザと連携させること（シングルサインオン）はできません。

LDAPアドレス帳ではないアドレス帳の共有または同期を可能にする方法として、アドオン [Addressbooks Synchronizer][]の使用が挙げられます。
このアドオンを使用すると、例えば以下のような運用も可能となります。

 * アドレス帳をIMAPサーバ上にメールの添付ファイルとして保存し、複数PC間でアドレス帳を同期する。
 * アドレス帳をHTTPまたはFTPサーバ上に設置しておき、複数ユーザ・複数PCから読み込み専用の共有アドレス帳として参照する。





## 初期状態で表示するカラムを変更しておきたい

キーワード：導入時初期設定

Thunderbirdのスレッドペインでは、初期状態でどのカラムを表示しておくかが決め打ちになっており、例えば「重要度」のようなカラムをすべてのフォルダ・すべてのアカウントで最初から表示された状態にしておきたいと思っても、管理者がそれを全クライアントに反映する事はできません。

アドオン[Set Default Columns][]を使用すると、初期状態で表示しておくカラムを[MCD（AutoConfig）](#mcd)の設定ファイルなどからカスタマイズすることができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)で、「重要度」のカラムを初期状態で表示するようにする設定例です。

    lockPref("extensions.set-default-columns@clear-code.com.columns", [
      "priorityCol", // 追加したカラム
      "threadCol",
      "threadCol",
      "attachmentCol",
      "flaggedCol",
      "subjectCol",
      "unreadButtonColHeader",
      "senderCol",
      "junkStatusCol",
      "dateCol",
      "locationCol"
    ].join(","));

既に1度でも内容を表示した事があるフォルダについては、最後に内容を表示した時の表示カラムの状態が記憶されています。
ここで設定した既定の表示カラムを反映するためには、カラム行の右端のアイコンをクリックしてメニューから「初期状態に戻す」を選択する必要があります。



# カスタマイズ済みのFirefox・Thunderbirdの展開



## アドオンを1つインストールするだけでカスタマイズが完了する、という形で複雑なカスタマイズ内容を展開したい

キーワード：導入時初期設定

アドオン [CCK2 Wizard](#cck)を使うと、当該アドオンのインストール1度だけで以下のようなカスタマイズを済ませることのできる「カスタマイズ用アドオン」を作成することができます。

 * ホームページの変更
 * Firefox Syncの無効化
 * アドオンマネージャからのアドオンのインストールの禁止
 * その他、[MCD（AutoConfig）](#mcd)相当の設定変更
 * Firefoxを既定のブラウザに自動設定する
 * ヘルプメニューの変更
 * ドメインごとの機能の利用許可の初期設定
 * 検索エンジンの変更・追加
 * 初期状態のブックマークの内容の変更
 * Windowsレジストリの変更
 * 証明書の自動インポート
 * about:configの利用禁止
 * プライベートブラウジング機能の利用禁止
 * アドオンの同梱
 * プラグインの同梱


## Firefox・ThunderbirdにMCD（AutoConfig）の設定ファイルをバンドルして展開したい

キーワード：導入時初期設定

実行ファイルを1つ実行するだけでFirefoxのインストールと設定ファイルの設置をすべて完了するソフトウェアの例としては、[Fx Meta Installer][]があります。
Fx Meta Instlalerの使用方法については、開発元による[Fx Meta Installerのチュートリアル][]などを参照して下さい。

Firefoxのインストール後に別途アドオンをインストールすることによってカスタマイズを完了する形態であれば、[CCK2 Wizard](#cck)によってそのようなアドオンを作成することができます。


## Firefox・Thunderbirdにアドオンをバンドルして展開したい

キーワード：導入時初期設定

実行ファイルを1つ実行するだけでFirefoxのインストールとアドオンのインストールをすべて完了するソフトウェアの例としては、[Fx Meta Installer][]があります。
Fx Meta Instlalerの使用方法については、開発元による[Fx Meta Installerのチュートリアル][]などを参照して下さい。

Firefoxのインストール後に別途アドオンをインストールすることによってカスタマイズを完了する形態であれば、[CCK2 Wizard](#cck)によってそのようなアドオンを作成することができます。


## FirefoxにJavaやFlashなどのプラグインをバンドルして展開したい

キーワード：導入時初期設定

実行ファイルを1つ実行するだけでFirefoxのインストールとプラグインのインストールをすべて完了するソフトウェアの例としては、[Fx Meta Installer][]があります。
Fx Meta Instlalerの使用方法については、開発元による[Fx Meta Installerのチュートリアル][]などを参照して下さい。

Firefoxのインストール後に別途アドオンをインストールすることによってカスタマイズを完了する形態であれば、[CCK2 Wizard](#cck)によってそのようなアドオンを作成することができます。



  [Addressbooks Synchronizer]: https://addons.mozilla.org/thunderbird/addon/addressbooks-synchronizer/
  [Always Default Client]: https://addons.mozilla.org/firefox/addon/always-default-client/
  [AutoConfiguration Hook]: https://addons.mozilla.org/thunderbird/addon/autoconfiguration-hook/
  [CCK2 Wizard]: https://mike.kaply.com/cck2/
  [Cert Importer]: https://github.com/clear-code/certimporter/releases
  [Disable about:config]: https://addons.mozilla.org/firefox/addon/disable-aboutconfig/
  [Disable Addons]: https://github.com/clear-code/disableaddons/releases
  [Disable Auto Update]: https://github.com/clear-code/disableupdate/releases
  [Disable Sync]: https://github.com/clear-code/disablesync/releases
  [Do Not Save Password]: https://addons.mozilla.org/firefox/addon/do-not-save-password/
  [DOM Inspector]: https://addons.mozilla.org/firefox/addon/dom-inspector-6622/
  [Duplicate Tabs Closer]: https://addons.mozilla.org/firefox/addon/duplicate-tabs-closer/
  [Flex Confirm Mail]: https://addons.mozilla.org/thunderbird/addon/flex-confirm-mail/
  [Force Addon Status]: https://addons.mozilla.org/firefox/addon/force-addon-status/
  [Fx Meta Installer]: https://github.com/clear-code/fx-meta-installer
  [Fx Meta Installerのチュートリアル]: http://www.clear-code.com/blog/2012/11/7.html
  [globalChrome.css読み込み用スクリプト]: https://github.com/clear-code/globalchromecss/blob/master/autoconfig-globalchromecss.js
  [Hide Option Pane]: https://addons.mozilla.org/firefox/addon/hide-option-pane/
  [History Prefs Modifier]: https://addons.mozilla.org/firefox/addon/history-prefs-modifier/
  [IMAPキャッシュの自動消去（Clear IMAP Cache）]: https://addons.mozilla.org/thunderbird/addon/clear-imap-local-cache/
  [Only Minor Update]: https://addons.mozilla.org/firefox/addon/only-minor-update/
  [Permissions Auto Registerer]: https://addons.mozilla.org/firefox/addon/permissions-auto-registerer/
  [Set Default Columns]: https://addons.mozilla.org/thunderbird/addon/set-default-columns/
  [UI Text Overrider]: https://addons.mozilla.org/firefox/addon/ui-text-overrider/
  [Windowsショートカットの直接実行（Open Windows Shortcuts Directly）]: https://github.com/clear-code/openshortcuts/releases
  [WinmailOpener]: https://www.google.co.jp/search?q=WinmailOpener
  [Winmail Opener Bridge]: https://addons.mozilla.org/thunderbird/addon/winmail-opener-bridge/
  [不正なアドレスの警告表示パッチ（Patch to Alert Invalid Addresses）]: https://addons.mozilla.org/thunderbird/addon/patch-to-alert-invalid-addr/
  [ローカルファイルからのリンク挿入（Insert Link from Local File）]: https://addons.mozilla.org/thunderbird/addon/insert-link-from-local-file/
  [添付ファイルの文字エンコーディングの自動判別（Attachemnt Encoding Detector）]: https://addons.mozilla.org/thunderbird/addon/attachemnt-encoding-detecto/
  [@-moz-document について参考]: http://www.akatsukinishisu.net/wiki.cgi?%40-moz-document
