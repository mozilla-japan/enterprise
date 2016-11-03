# 設定の管理

## 設定を管理者が管理したい {#control-configurations-by-administrator}

キーワード: 機能制限、導入時初期設定、集中管理

Firefox や Thunderbird には、設定を管理者が管理し、ユーザーが自由に変更できないようにするための機能が備わっています。この機能は「Mission Control Desktop (MCD)」や「AutoConfig」などと呼ばれています。

また、アドオンを使うと Active Directory のグループポリシーで設定を集中管理することもできます。

### ウィザードでの実現 {#cck}

アドオン [CCK2 Wizard][] を使用すると、MCD 相当の設定を行ったり、それ以上のことをしたりするアドオンまたは設定ファイル群を作成することができます。

CCK2 Wizard の大まかな利用手順は以下の通りです。

1. 管理者の PC 上の Firefox に、CCK2 Wizard を通常通りインストールします。
2. ツールバー上に追加される [CCK2 Wizard] ボタンをクリックし、ウィザードを起動します。
3. [File] > [New] と辿り、カスタマイズ用設定の名前と一意な識別子を入力します。
4. ウィザード (設定の入力画面) が出るので、行いたいカスタマイズの内容を決定します。
5. ウィザードの最後のページで [Create an Extension] または [Use AutoConfig] ボタンを押下し、カスタマイズ用のファイルを出力します。
6. 5 で「Create an Extension」を選択した場合、アドオンのインストールパッケージが出力されるので、各クライアントにアドオンをインストールします。「AutoConfig」を選択した場合、カスタマイズ用ファイルを圧縮した ZIP ファイルが出力されるので、各クライアントの Firefox のインストール先に ZIP ファイルの内容を展開して設定ファイル群をインストールします。

### MCD 用設定ファイルでの実現 {#mcd}

以下では、Firefox の自動アップデートを禁止するという場合を例にとって設定の手順を説明します。

#### 設定方法

以下の内容のプレーンテキストファイル `autoconfig.js` を用意します。

```js
pref("general.config.filename", "autoconfig.cfg");
pref("general.config.vendor", "autoconfig");
pref("general.config.obscure_value", 0);
```

作成した `autoconfig.js` を、Firefox のインストール先の `defaults/pref/` ディレクトリーに置きます (Windows であれば `C:\Program Files (x86)\Mozilla Firefox\defaults\pref\autoconfig.js` など)。

以下の内容のプレーンテキストファイル `autoconfig.cfg` を用意します。

```js
// 1 行目は必ずコメントとしてください。
lockPref("app.update.enabled", false);
```

作成した `autoconfig.cfg` を、Firefox または Thunderbird のインストール先ディレクトリーに置きます (Windows であれば `C:\Program Files (x86)\Mozilla Firefox\autoconfig.cfg` など)。

以上で設定は完了です。

#### 確認方法

Firefox を起動してオプション (設定画面) を開き、[詳細] > [更新] と辿って、自動更新に関する設定が [更新の確認は行わない] で固定されグレイアウトされていることを確認してください。

#### 詳細情報

`autoconfig.cfg` では以下の 3 つのディレクティブで Firefox・Thunderbird の設定を管理することができます。

* `defaultPref("設定名", 値)`: 設定を指定した値に変更します。ユーザーは設定を自由に変更でき、変更後の値は Firefox・Thunderbird の終了後も保存されます。
* `pref("設定名", 値)`: 設定を指定した値に変更します。ユーザーは設定を一時的に変更できますが、変更後の値は Firefox・Thunderbird を終了すると失われます。(次回起動時には、`autoconfig.cfg` で指定した値に戻ります。)
* `lockPref("設定名", 値)`: 設定を指定した値に固定します。ユーザーは設定を変更することはできません。

また、`autoconfig.cfg` では JavaScript の制御構文や環境変数の参照、LDAP サーバーからの情報の取得 (※ Thunderbird のみ) も利用できます。詳しくは以下の情報を参照してください。

* [Mozilla 製品の集中管理 - 基本編 - MCD | MDN](https://developer.mozilla.org/ja/docs/MCD/Getting_Started)
* [MCD, Mission Control Desktop AKA AutoConfig | MDN](https://developer.mozilla.org/ja/docs/MCD,_Mission_Control_Desktop_AKA_AutoConfig)

設定を変更する場合は、新しい `autoconfig.cfg` で古い `autoconfig.cfg` を上書きしてください。

`autoconfig.cfg` で管理できる設定項目は、`about:config` (設定エディター) の一覧に表示されるもの、もしくは一覧に現れていない隠し設定のみに限られます。アドオンの有効・無効の状態、ウェブサイトごとの機能の利用許可、メニュー項目の表示・非表示などは、`autoconfig.cfg` では管理できません。

なお、Firefox 43 以前では、設定画面の「プライバシー」パネルに対応する設定を `pref()` や `defaultPref()` で変更した場合、設定ダイアログを開いた時の状態が期待通りに初期化されない場合があります。この問題の簡単な回避策としては、アドオン [History Prefs Modifier][] が利用できます。Firefox 44 以降ではこの問題は修正されています。

<!--
`defaultPref()` だけを使うのであれば、`distribution/distribution.ini` で以下のようにするという手もある。

```ini
[Preferences]
mozilla.partner.id="testpartner"
app.distributor="testpartner"
app.distributor.channel=
browser.search.distributionID="com.testpartner"

[LocalizablePreferences]
browser.startup.homepage="http://sandmill.org/%LOCALE%/%LOCALE%/"
browser.startup.homepage_reset="http://sandmill.org/%LOCALE%/"
```

* [Customizing Firefox – distribution.ini | Mike's Musings](http://mike.kaply.com/2012/03/26/customizing-firefox-distribution-ini/ "Customizing Firefox – distribution.ini | Mike's Musings")
* [Creating a Customized Firefox Distribution | Mike's Musings](http://mike.kaply.com/2010/08/05/creating-a-customized-firefox-distribution/ "Creating a Customized Firefox Distribution | Mike's Musings")

が、話がややこしくなるので、ここでは触れないことにする。
-->

### グループポリシーでの実現 {#group-policy}

アドオン [GPO For Firefox][] を使用すると、グループポリシー経由で MCD と同様の設定の集中管理を行えます。

#### 設定の手順

* 各クライアントについては、[管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って GPO For Firefox をインストールします。
* ドメインコントローラについては、[アドオンのダウンロードページ][GPO For Firefox] の「You can find an adm file ready to be used for your GPO at the following link.」と書かれた箇所にあるリンクから管理用テンプレートファイル (adm ファイル) をダウンロードして読み込ませます。その後、読み込まれたテンプレートを使って設定を行います。例えば、Windows Server 2008 R2 での手順は以下の通りです。
    1. Active Directory ドメインを構築します。
    2. ドメインの管理者でログインします。
    3. [ローカル グループ ポリシー エディターを開く](https://technet.microsoft.com/ja-jp/library/cc731745.aspx "ローカル グループ ポリシー エディターを開く") の手順に則って、ローカル グループ ポリシー エディターを起動します。(ファイル名を `gpedit.msc` と指定して起動します。)
    4. [従来の管理用テンプレートを追加または削除する](https://technet.microsoft.com/ja-jp/library/cc772560.aspx "従来の管理用テンプレートを追加または削除する") の手順に則って、テンプレートを読み込ませます。([コンピューターの構成] 配下の [管理用テンプレート] を右クリックして [テンプレートの追加と削除] を選択し、`firefox.adm` を指定して追加します。)
    5. [従来の管理用テンプレート (ADM)」配下に「Mozilla Firefox」が追加されるので、必要な設定を変更します。

以降は、ドメインに参加した Windows PC 上で Firefox を起動する度に、グループポリシーで変更された設定が読み込まれ、反映されるようになります。

#### 注意点

* 上記ページからダウンロードできる管理用テンプレートファイルの内容は、すべて英語となっています。日本語で設定を管理したい場合は、管理用テンプレートファイルを自分で翻訳する必要があります。
* 管理できる設定項目は、管理用テンプレートファイルに記述されているもののみとなります。それ以外の設定を管理したい場合は、管理用テンプレートファイルを自分で編集する必要があります。

#### 管理用テンプレートファイルにない設定項目の管理について

Firefox や Thunderbird 自体の更新によって追加・変更・廃止された設定をグループポリシーとして管理できるようにするためには、管理用テンプレートファイルを自分で修正・更新する必要があります。

管理用テンプレートファイルを編集する際は、MCD での設定で使用する設定名とその値が、ドメインのメンバーとなる Windows PC の以下のレジストリキー以下に書き出されるようにしてください。

* ユーザー自身による変更を許容しない、管理者が固定する設定 (Locked Settings)
    * 全ユーザーに反映する場合: `HKEY_LOCAL_MACHINE\Software\Policies\Mozilla\lockPref`
    * ユーザーごとに反映する場合: `HKEY_CURRENT_USER\Software\Policies\Mozilla\lockPref`
* ユーザー自身による変更を許容する、初期値の設定 (Default Settings)
    * 全ユーザーに反映する場合: `HKEY_LOCAL_MACHINE\Software\Policies\Mozilla\defaultPref`
    * ユーザーごとに反映する場合: `HKEY_CURRENT_USER\Software\Policies\Mozilla\defaultPref`

真偽型の設定は、`true` を整数の `1`、`false` を整数の `0` として書き出してください。

例えば「Firefox の自動アップデートを禁止する設定を、全ユーザーに対して、強制的に反映させる」という場合の設定内容は以下の要領です。

* 書き込む先のレジストリキー: `HKEY_LOCAL_MACHINE\Software\Policies\Mozilla\lockPref`
* 書き込む値の名前: `app.update.enabled`
* 書き込む値のデータ: `0`

## すべてのクライアントの設定を管理者が一括して変更したい

キーワード: 機能制限、導入時初期設定、集中管理

Active Directory ドメインに参加している Windows PC では、[グループポリシー](#group-policy) によって、管理者が全クライアントの設定を一括して管理・変更することができます。

グループポリシーを使用しない場合でも、Firefox や Thunderbird の独自の設定管理機能である [MCD (AutoConfig)](#mcd) では、各クライアントのローカルディスク上に設置した設定ファイルだけでなく、サーバー上に設置した設定ファイルを読み込ませることができます。これにより、管理者が 1 つの設定ファイルを管理するだけで全クライアントの設定を一括して管理・変更するという運用が可能です。

以下では、設定ファイルを `http://internalserver/autoconfig.jsc` として提供して Firefox の自動アップデートを禁止するという場合を例にとって MCD での設定の手順を説明します。

### 設定方法

以下の内容のプレーンテキストファイル `autoconfig.js` を用意します。

```js
pref("general.config.filename", "autoconfig.cfg");
pref("general.config.vendor", "autoconfig");
pref("general.config.obscure_value", 0);
```

作成した `autoconfig.js` を、Firefox のインストール先の `defaults/pref/` ディレクトリーに置きます (Windows であれば `C:\Program Files (x86)\Mozilla Firefox\defaults\pref\autoconfig.js` など)。

以下の内容のプレーンテキストファイル `autoconfig.cfg` を用意します。

```js
// 1 行目は必ずコメントとしてください。
lockPref("autoadmin.global_config_url", "http://internalserver/autoconfig.jsc");
```

作成した `autoconfig.cfg` を、Firefox または Thunderbird のインストール先ディレクトリーに置きます (Windows であれば `C:\Program Files (x86)\Mozilla Firefox\autoconfig.cfg` など)。

以下の内容のプレーンテキストファイル `autoconfig.jsc` を用意します。

```js
// 1 行目は必ずコメントとしてください。
lockPref("app.update.enabled", false);
```

次に、上記の URL にてファイルをダウンロード可能なように、設定ファイルの提供用サーバーにファイルを設置します。また、ファイルは以下の MIME タイプを伴って送信されるように設定します。

```
application/x-javascript-config
```

以上で設定は完了です。

### 確認方法

Firefox を起動してオプション (設定画面) を開き、[詳細] > [更新] と辿って、自動更新に関する設定が [更新の確認は行わない] で固定されグレイアウトされていることを確認してください。

### 詳細情報

`autoconfig.jsc` の書式と設定可能な設定項目の種類は、`autoconfig.cfg` と同一です。詳細は [設定を管理者が管理したい](#control-configurations-by-administrator) を参照してください。

なお、`autoconfig.jsc` はウェブサーバーでの提供以外に、ローカルファイル、ファイル共有サーバー上のファイルなどの形でも提供できます。以下はすべて有効な指定です。

```js
// ローカルファイルとして提供する場合 (ネットワークドライブをマウントする場合など)
lockPref("autoadmin.global_config_url", "file:///Z:/firefox/autoconfig.jsc");

// Samba サーバー、NAS などの上にファイルを設置する場合
lockPref("autoadmin.global_config_url", "file://///file-server/shared/firefox/autoconfig.jsc");
```

## 一部の設定項目を非表示にして、ユーザーが設定を変更できないようにしたい

キーワード: 機能制限、導入時初期設定、集中管理

[MCD (AutoConfig)](#mcd) や [グループポリシーによる設定](#group-policy) では、管理者が Firefox や Thunderbird の設定を固定し、ユーザー自身による自由な変更を禁止することができます。また、アドオンを併用することによって、変更できなくした設定を画面上に表示しないようにすることができます。

### ウィザードでの実現

[CCK2 Wizard](#cck) を使用すると、設定値を変更不可能な状態に固定する機能を含むアドオンを作成することができます。

### MCD での実現

[MCD (AutoConfig)](#mcd) 機能が提供する `lockPref()` ディレクティブを使用すると、ユーザーによる設定の変更を禁止できます。詳細は [設定を管理者が管理したい](#control-configurations-by-administrator) を参照してください。

`lockPref()` によって値が固定された設定は、Firefox・Thunderbird の設定画面上ではグレイアウトして表示されます。

変更できない状態になっている設定項目をそもそも UI 上に表示しないようにするためには、アドオン [globalChrome.css][] を使うなどして UI 要素を隠す必要があります。globalChrome.css を使う場合の手順は以下の通りです。

1. [DOM Inspector][] をインストールします。
2. [ツール] > [ウェブ開発] > [DOM Inspector] で DOM Inspector を起動し、その状態で設定画面を開きます。
3. 設定ダイアログを操作し、非表示にしたい設定項目が表示された状態にします。
4. [File] > [Inspect Chrome Document] を選択し、設定画面のタイトルと同じ項目を選択します。
5. 非表示にしたい項目の ID を調べる。
6. 「メモ帳」などのテキストエディターを開き、4 で調べた ID を使って項目を非表示にするスタイル指定を記述します。以下は Firefox の設定の [一般] パネルにおける起動時の挙動の設定を非表示にする場合の例。

    ```css
    @-moz-document url-prefix(chrome://browser/content/preferences/preferences.xul) {
      #startupGroup {
        /* display:none はDOMツリーに変化を与えて挙動を壊す恐れがあるため、
           単に非表示にするのみとする。 */
        visibility: collapse !important;
        -moz-user-focus: ignore !important;
      }
    }
    ```

    (`@-moz-document` は、特定のウィンドウに対してのみスタイル指定を反映させるための記述です。詳細は [@-moz-document について参考][] を参照してください。)
7. 6 で作成した内容を `globalChrome.css` という名前のプレーンテキストファイルに保存します。
8. 7 で作成したファイルを Firefox (Thunderbird) のインストール先の `chrome` フォルダーに設置します (Windows Vista 以降の場合のファイルの設置場所は `C:\Program Files (x86)\Mozilla Firefox\chrome\globalChrome.css` となる)。
9. [管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って [globalChrome.css][] を導入します。

なお、設定画面上部の [全般] [タブ] などのパネル切り替えボタン自体や、[詳細] における [更新] などのタブを非表示にする場合には注意が必要です。これらの切り替えボタンやタブを単純に非表示にすると、ボタンやタブとパネルの内容の対応関係が崩れる場合があります。これらの問題の簡単な解決策としては、アドオン [Hide Option Pane][] の利用が挙げられます。

### グループポリシーでの実現

[グループポリシーによる設定](#group-policy) では、ユーザー自身による変更を許容しない設定 (Locked Settings) も可能です。

ただし、グループポリシーとの連携だけでは設定項目は非表示にできません。設定項目を非表示にするためには、MCD の場合と同様に、アドオン [globalChrome.css][] を使うなどして UI 要素を隠す必要があります。

## Thunderbird のアカウント設定を非表示にしたい (管理者が設定を集中管理するので、アカウント設定の画面にアクセスさせたくない)

キーワード: 機能制限、導入時初期設定、集中管理

[MCD (AutoConfig)](#mcd) や [グループポリシー](#group-policy) などの方法でアカウント設定を管理者が管理する際に、ユーザーがアカウント設定の画面にアクセスできないようにすることができます。

### 設定方法

アカウント設定画面へのアクセス経路を UI 上に表示しないようにするためには、アドオン [globalChrome.css][] を使うなどしてメニュー項目を隠す必要があります。globalChrome.css を使う場合の手順は以下の通りです。

1. 「メモ帳」などのテキストエディターを開き、4 で調べた ID を使って項目を非表示にするスタイル指定を記述します。

    ```css
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
    ```

    (`@-moz-document` は、特定のウィンドウに対してのみスタイル指定を反映させるための記述です。詳細は [@-moz-document について参考][] を参照してください。)
2. 1 で作成した内容を `globalChrome.css` という名前のプレーンテキストファイルに保存します。
3. 2 で作成したファイルを Thunderbird のインストール先の `chrome` フォルダーに設置します (Windows Vista 以降の場合のファイルの設置場所は `C:\Program Files (x86)\Mozilla Thunderbird\chrome\globalChrome.css` となる)。
4. [管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って [globalChrome.css][] を導入します。

## about:config (設定エディター) の利用を禁止したい

キーワード: 機能制限、導入時初期設定、集中管理

無用なトラブルを避けるため、ユーザーが `about:config` (設定エディター) の画面にアクセスできないようにすることができます。

### 設定方法

`about:config` の利用を禁止する最も簡単な方法は、アドオン [Disable about:config][] を使うことです。[管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Disable about:config を導入すると、`about:config` へのアクセスが完全に禁止されます。

また、[CCK2 Wizard](#cck) でも同様のカスタマイズが可能です。

# アドオン、プラグイン

## アドオンの利用を禁止したい (ユーザーが任意にアドオンをインストールできないようにしたい)

キーワード: 機能制限、導入時初期設定、集中管理、アドオン

無用なトラブルを避けるため、ユーザーが任意にアドオンをインストールできないよう設定することができます。

### 設定方法

アドオンの利用を禁止する最も簡単な方法は、アドオン [Disable Addons][] を使うことです。[管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Disable Addons を導入すると、以下の操作が完全に禁止されます。

* ユーザーがウェブページからアドオンをダウンロードしてきてインストールする。
* ユーザーがアドオンのインストーラパッケージを Firefox のウィンドウにドラッグ＆ドロップしてインストールする。
* ユーザーがアドオンのインストーラパッケージを Firefox のショートカットにドラッグ＆ドロップしてインストールする。
* ユーザーがアドオンマネージャーを閲覧・操作する。

### 注意事項

アドオン「Disable Addons」は、すでにインストール済みの他のアドオンの状態を変更しません。すでにインストール済みのアドオンをシステム管理者の判断で強制的に無効化する方法は、[特定のアドオンやプラグイン (Java など) を常に無効化したい](#disable-addons-by-administrator) を参照してください。

また、このアドオンはアドオンマネージャーへのアクセスを禁止する機能を含むため、必然的に、アドオンマネージャーを必要とする以下の操作が行えなくなります。

* アドオンの有効・無効の状態を変更する。
* アドオンをアンインストールする。
* アドオンの設定を変更する。(Tab Mix Plus などのように、[ツール] メニュー等からアドオンの設定を変更できるようになっている場合を除く)

このアドオン自体をアンインストールするには、システム管理者がクライアント上からアドオンの実体となるファイルを削除する必要があります。

## 特定のアドオンやプラグイン (Java など) を常に無効化したい {#disable-addons-by-administrator}

キーワード: 機能制限、導入時初期設定、集中管理、アドオン、プラグイン

システムに導入されている Java や Flash などのプラグイン、他のソフトウェアが自動的に追加するアドオンなどを、システム管理者の判断で強制的に無効化することができます。

### 設定方法

アドオンやプラグインの有効・無効の状態をシステム管理者が制御する最も簡単な方法は、アドオン [Force Addon Status][] を使うことです。[管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Force Addon Status を導入した上で、[MCD (AutoConfig)](#mcd) を使って以下のような設定を施すことで、指定したアドオンやプラグインの状態を強制的に設定することができます。

```js
// Test Pilot アドオンを強制的に無効化する例
pref("extensions.force-addon-status@clear-code.com.addons.tbtestpilot@labs.mozilla.com.status",
     "disabled"); // 設定する有効・無効の状態 ("enabled" = 有効、"disabled" = 無効)

// Java プラグインを強制的に無効化する例
pref("extensions.force-addon-status@clear-code.com.plugins.java.pattern",
     "^Java\(TM\) Plug-in"); // 判別のためのルール (正規表現)
pref("extensions.force-addon-status@clear-code.com.plugins.java.enabledState",
     0); // 設定する有効・無効の状態 (0 = 常に無効、1 = クリックされたら有効にする、2 = 常に有効)
```

アドオンの状態を制御する場合は、`extensions.force-addon-status@clear-code.com.addons.(アドオンの内部的な ID).status` という名前の文字列型の設定を 1 つ作成します。値が `enabled` であればアドオンは有効化され、`disabled` であれば無効化されます。

プラグインの状態を制御する場合は、`extensions.force-addon-status@clear-code.com.plugins.(ドットを含まない任意の識別名).pattern` と `extensions.force-addon-status@clear-code.com.plugins.(ドットを含まない任意の識別名).enabledState` という 2 つの設定を使用します。まずプラグインを識別するための正規表現のルールを `extensions.force-addon-status@clear-code.com.plugins.(ドットを含まない任意の識別名).pattern` という名前の文字列型の設定として作成します。正規表現は、`about:plugins` で表示されるプラグインの名前にマッチするようにします。次に、プラグインの状態を制御する `extensions.force-addon-status@clear-code.com.plugins.(ドットを含まない任意の識別名).enabledState` という名前の数値型の設定を作成します。値が `2` であればプラグインは常に有効化され、値が `0` であれば常に無効化されます。値が `1` であれば、初期状態では無効化され、プラグイン有効化のメッセージがクリックされると有効化されます (既定の動作)。

## 管理者によるアドオンのインストール手順 {#install-addons-by-administrator}

キーワード: 導入時初期設定、アドオン

Firefox や Thunderbird は通常、ユーザーが任意のアドオンをインストールして使用します。以下の手順に則ると、管理者が、そのクライアント上のすべてのユーザーを対象としてアドオンをインストールすることができます。

管理者の手動操作によるアドオンのインストール方法にはいくつかのパターンがあり、それぞれメリットとデメリットがあります。[DOM Inspector][] をインストールする場合を例にとって、代表的な 3 つのパターンを解説します。

#### パターン 1: 組み込みモジュールとしてインストールする

※ [Bug 1144127](https://bugzilla.mozilla.org/show_bug.cgi?id=1144127 "1144127 – Remove support for distribution/bundles") での変更により、この方法は Firefox 40 およびそれ以降のバージョンでは利用できなくなりました。

この場合のインストール手順は以下の通りです。

1. Firefox の実行ファイルと同じ位置に `distribution` という名前でフォルダーを作成します。Firefox が `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、作成するフォルダーのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution` となります。
2. 1 で作成したフォルダーの中に `bundles` という名前でフォルダーを作成します。
3. 2 で作成したフォルダーの中に、インストールしたいアドオンの内部的な ID と同じ名前でフォルダーを作成します。DOM Inspector であれば、フォルダー名は `inspector@mozilla.org` となります。
 4. アドオンのインストールパッケージ (xpi ファイル) を ZIP 形式の圧縮ファイルとして展開し、取り出されたすべてのファイルやフォルダーを 3. で作成したフォルダーの中に置きます。DOM Inspector であれば、以下のようなファイル配置になります。
    * `C:\Program Files (x86)\Mozilla Firefox\distribution\bundles\inspector@mozilla.org\install.rdf`
    * `C:\Program Files (x86)\Mozilla Firefox\distribution\bundles\inspector@mozilla.org\chrome.manifest`
    * ...

ただし、そのアドオンが検索プラグイン (検索プロバイダー) を含んでいる場合、検索プラグインのファイルは `distribution\bundles` 以下ではなく、`distribution\searchplugins\common` 以下に設置する必要があります。

この手順でインストールしたアドオンは以下の特徴を持ちます。

* *当該アドオンはアドオンマネージャーの管理下から外れます。* (Firefox 組み込みのモジュールの 1 つとして認識されるようになります。)
    * *当該アドオンはアドオンマネージャー上に表示されません。* ユーザーは当該アドオンをアドオンマネージャーから認識できません。
    * ユーザーは当該アドオンを削除できません。
    * *ユーザーは当該アドオンを無効化できません。*
* *当該アドオンは自動アップデートされません。* ただし、アップデート後のバージョンを通常のアドオンとしてユーザーがインストールすることはでき、その場合、その後は通常通り自動アップデートされるようになります。
* *Add-on SDK ベースのアドオン、再起動不要なアドオンは、この方法では動作しません。* (ただし、例外的にこの方法でインストールしても動作する再起動不要なアドオンはいくつか存在します。)
* *アドオンは次回起動時から強制的に有効化されます。*

#### パターン 2: 全ユーザー向けのアドオンとしてインストールする

この場合のインストール手順は以下の通りです。

1. アドオンのインストールパッケージを入手します。
2. アドオンのインストールパッケージ (xpi ファイル) を ZIP 形式の圧縮ファイルとして展開し、取り出されたファイル群の中の `install.rdf` をテキストエディターなどで開き、`<em:unpack>true</em:unpack>` または `em:unpack="true"` という記述があるかどうかを調べます。
    * `unpack` の指定がある場合:
        1. アプリケーション組み込みアドオンの設置用のフォルダーを作成します。
            * `C:\Program Files (x86)\Mozilla Firefox` にインストールされている Firefox の場合、作成するフォルダーのパスは `C:\Program Files (x86)\Mozilla Firefox\browser\extensions` となります。
            * `C:\Program Files (x86)\Mozilla Thunderbird` にインストールされている Thunderbird の場合、作成するフォルダーのパスは `C:\Program Files (x86)\Mozilla Thunderbird\extensions` となります。
        2. 1 で作成したフォルダーの中に、インストールしたいアドオンの内部的な ID と同じ名前でフォルダーを作成します。DOM Inspector であれば、フォルダー名は `inspector@mozilla.org` となります。
        3. アドオンのインストールパッケージ (xpi ファイル) を ZIP 形式の圧縮ファイルとして展開し、取り出されたすべてのファイルやフォルダーを 2. で作成したフォルダーの中に置きます。DOM Inspector であれば、以下のようなファイル配置になります。
            * `C:\Program Files (x86)\Mozilla Firefox\browser\extensions\inspector@mozilla.org\install.rdf`
            * `C:\Program Files (x86)\Mozilla Firefox\browser\extensions\inspector@mozilla.org\chrome.manifest`
            * ...
    * `unpack`の指定がない場合:
        1. アドオンのインストールパッケージ (xpi ファイル) のファイル名を、`アドオンの内部的な ID.xpi` に変更します。DOM Inspector であれば、ファイル名は `inspector@mozilla.org.xpi` となります。
        2. 1 で用意したファイルを、適切な位置に設置します。
            * `C:\Program Files (x86)\Mozilla Firefox` にインストールされている Firefox の場合、ファイルを設置するフォルダーのパスは `C:\Program Files (x86)\Mozilla Firefox\browser\extensions` となります。
            * `C:\Program Files (x86)\Mozilla Thunderbird` にインストールされている Thunderbird の場合、ファイルを設置するフォルダーのパスは `C:\Program Files (x86)\Mozilla Thunderbird\extensions` となります。
3. [MCD (AutoConfig)](#mcd) などを使い、以下の設定を反映します。

    ```js
    pref("extensions.autoDisableScopes", 11);
    // この設定値は、整数値で表現された以下のフラグの組み合わせ。
    // ユーザーの意図が関与せずにインストールされたアドオンが
    // 以下のフラグで示されるインストール方法に該当する場合、そのアドオンは
    // 次回起動時に自動的に無効化され、ユーザーに有効化の可否が確認される。
    //  1: 現在のユーザープロファイルのみを対象としたインストール
    //      (通常のインストール)
    //  2: 現在ログインしているユーザーのすべてのユーザープロファイルを対象としたインストール
    //      (HKEY_CURRENT_USER 以下のレジストリを使用したインストールなど)
    //  4: そのインストール先のアプリケーションのすべてのユーザーを対象としたインストール
    //      (C:\Program Files (x86)\Mozilla Firefox\browser\extensions 以下へのファイル配置)
    //  8: そのコンピューターのすべてのアプリケーションのすべてのユーザーを対象としたインストール
    //      (C:\Program Files (x86)\Mozilla Firefox\browser\extensions 以下へのファイル配置、
    //       HKEY_LOCAL_MACHINE 以下のレジストリを使用したインストールなど)
    ```

    この設定を行わないと、アドオンは次回起動時には無効化された状態となります。

この手順でインストールしたアドオンは以下の特徴を持ちます。

* *当該アドオンはアドオンマネージャーの管理下に置かれます。*
    * *当該アドオンはアドオンマネージャー上に表示されます。* ユーザーは当該アドオンをアドオンマネージャーから認識できます。
    * ユーザーは当該アドオンを削除できません。後述の通り、ユーザーはアップデート後のアドオンを削除することはできますが、その場合は、管理者がインストールした最初のバージョンに戻るという結果になります。
    * *ユーザーは当該アドオンを無効化できます。*
* *当該アドオンは自動アップデートされません。* ただし、アップデート後のバージョンを通常のアドオンとしてユーザーがインストールすることはでき、その場合、その後は通常通り自動アップデートされるようになります。
* *Add-on SDK ベースのアドオン、再起動不要なアドオンも、この方法でインストールできます。*
* `extensions.autoDisableScopes` の設定を変更していないと、*当該アドオンは次回起動時に強制的に無効化されます。*

#### パターン 3: 新規プロファイル作成時に同時にインストールされるアドオンとして登録する

この場合のインストール手順は以下の通りです。

1. Firefox の実行ファイルと同じ位置に `distribution` という名前でフォルダーを作成します。Firefox が `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、作成するフォルダーのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution` となります。
2. 1 で作成したフォルダーの中に `extensions` という名前でフォルダーを作成します。
3. 2 で作成したフォルダーの中に、インストールしたいアドオンのインストールパッケージ (xpi ファイル) を設置します。ファイル名はアドオンの内部的な ID に合わせて変更します。DOM Inspector であれば、ファイル名は `inspector@mozilla.org.xpi` で、最終的なファイルのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution\extensions\inspector@mozilla.org.xpi` となります。
4. ユーザー権限で Firefox を起動します。それが初回起動であれば、アドオンが自動的にインストールされます。

この手順でインストールしたアドオンは以下の特徴を持ちます。

* *すでに存在しているユーザープロファイルで Firefox を起動した場合、当該アドオンはインストールされません*。当該アドオンが自動的にインストールされるのは、あくまで、新規の導入時などで新しいプロファイルが作成された場合のみに限られます。
* 当該アドオンは、ユーザーが自分でインストールしたのと同じ扱いになります。
    * 当該アドオンはアドオンマネージャー上に表示されます。
    * *ユーザーは当該アドオンを削除できます。*
    * *ユーザーは当該アドオンを無効化できます。*
* *当該アドオンは自動アップデートされます。*
* Add-on SDK ベースのアドオン、再起動不要なアドオンも、この方法でインストールできます。

#### その他のパターン

上記の 3 パターン以外にも、アドオンを管理者がインストールするための方法はいくつかあります。詳細は以下の開発者向け情報を参照してください。

* [Installing extensions - Mozilla | MDN](https://developer.mozilla.org/en-US/Add-ons/Installing_extensions?redirectlocale=en-US&amp;redirectslug=Installing_extensions ) (英語)

# 複数バージョンの併用

## Firefox や Thunderbird を別のプロファイルで同時に起動したい

キーワード: 導入時初期設定

Firefox (および Thunderbird) は通常、すでに Firefox が起動している状態でもう一度 Firefox をショートカット等から起動しようとすると、すでに起動している Firefox において新しいウィンドウを開くという操作になります。Firefox の実行ファイルに対して起動オプションを与えることで、異なるユーザープロファイルで Firefox を同時に起動することができます。

### 設定方法

例として、(設定の検証などに使用する) 新規プロファイル環境の Firefox を同時に起動できるようにする手順を示します。

1. プロファイル情報保存用のフォルダーを任意の位置に作成します。ここでは例として、`%AppData%\Mozilla\Firefox\Profiles\another` に作成することにします。
2. Firefox を起動するためのショートカットをデスクトップ上にコピーし、任意の名前に変更します。ここでは例として「Firefox Another」とします。
3. 2 で作成した新しいショートカットのプロパティを開き、「リンク先」に記載されている Firefox の実行ファイルへのパスの後に、` -no-remote -profile " (1.で作成したフォルダーのパス) "` というオプションの指定を加えます。Firefox が `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、最終的なリンク先は以下のようになります。

```
"C:\Program Files (x86)\Mozilla Firefox\firefox.exe" -no-remote -profile "%AppData%\Mozilla\Firefox\Profiles\another"
```

以上で、同じバージョンの Firefox を別々のプロファイルで同時に起動できるようになります。通常のショートカットで起動すると今まで通りの Firefox が、上記手順で作成したショートカットで起動すると新規プロファイルの環境の Firefox がそれぞれ起動します。

なお、他のアプリケーションでリンクを開こうとした場合や、URL ショートカットを開こうとした場合には、上記手順で作成した新規プロファイルではなく、既存プロファイルの Firefox が起動します。

## 複数のバージョンの Firefox や Thunderbird を併用し、同時に起動したい

キーワード: 導入時初期設定

Firefox の実行ファイルに対して起動オプションを与えることで、異なるバージョンの Firefox を同時に起動することができます。

### 設定方法

例として、通常リリース版の Firefox がインストールされている環境で、ESR 版 Firefox を同時に起動できるようにする手順を示します。

1. 起動中の Firefox のウィンドウをすべて閉じ、終了します。
2. 新たにインストールしたいバージョンの Firefox のインストーラを起動します。
3. 「カスタムインストール」を選択し、インストール先を今まで使用していたバージョンの Firefox とは異なる位置に指定します。ここでは例として、`C:\Program Files (x86)\Mozilla Firefox ESR` にインストールすることにします。また、この時デスクトップおよびスタートメニューのショートカットは作成しないようにします。(既存のショートカットを上書きしないため)
4. ESR 版 Firefox 起動専用のプロファイル情報保存用のフォルダーを任意の位置に作成します。ここでは例として、`%AppData%\Mozilla\Firefox\Profiles\esr` に作成することにします。
5. 3 でインストールした Firefox の実行ファイルへのショートカットをデスクトップ上に作成し、任意の名前を付けます。ここでは例として、「Firefox ESR」とします。
6. 5 で作成した新しいショートカットのプロパティを開き、「リンク先」に記載されている Firefox の実行ファイルへのパスの後に、` -no-remote -profile " (5.で作成したフォルダーのパス) "` というオプションの指定を加えます。ここまでの手順の例に則ると、最終的なリンク先は以下のようになります。

```
"C:\Program Files (x86)\Mozilla Firefox ESR\firefox.exe" -no-remote -profile "%AppData%\Mozilla\Firefox\Profiles\esr"
```

以上で、通常リリース版の Firefox と ESR 版 Firefox を同時に起動できるようになります。通常のショートカットで起動すると今まで通りの Firefox が、上記手順で作成したショートカットで起動すると ESR 版の Firefox がそれぞれ起動します。

なお、他のアプリケーションでリンクを開こうとした場合や、URL ショートカットを開こうとした場合には、上記手順でセットアップした ESR 版 Firefox ではなく、通常リリース版 (既存プロファイル) の Firefox が起動します。

# 情報漏洩対策

## 社外サイトへアクセスする機能を全て無効化したい

キーワード: 機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefox にはネットワーク上のサーバーと連携する機能が多数含まれています。情報漏洩対策その他の理由から外部ネットワークへの意図しない通信を行わないようにしたい場合には、各機能を無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
// アプリケーション自体の自動更新の URL
lockPref("app.update.url", "");
lockPref("app.update.url.details", "");
lockPref("app.update.url.manual", "");

// プラグインのブロック時などの詳細説明の URL
lockPref("app.support.baseURL", "");
// ウェブサイトの互換性情報の URL
lockPref("breakpad.reportURL", "");
// about:home に表示するアドバイス情報の取得元 URL
lockPref("browser.aboutHomeSnippets.updateUrl", "");

// ウェブサービスとの連携
// ウェブフィード用のサービス
lockPref("browser.contentHandlers.types.0.uri", "");
lockPref("browser.contentHandlers.types.1.uri", "");
pref("browser.contentHandlers.types.2.uri", "");
pref("browser.contentHandlers.types.3.uri", "");
pref("browser.contentHandlers.types.4.uri", "");
pref("browser.contentHandlers.types.5.uri", "");
// IRC 用のサービス
lockPref("gecko.handlerService.schemes.irc.0.uriTemplate", "");
pref("gecko.handlerService.schemes.irc.1.uriTemplate", "");
pref("gecko.handlerService.schemes.irc.2.uriTemplate", "");
pref("gecko.handlerService.schemes.irc.3.uriTemplate", "");
lockPref("gecko.handlerService.schemes.ircs.0.uriTemplate", "");
pref("gecko.handlerService.schemes.ircs.1.uriTemplate", "");
pref("gecko.handlerService.schemes.ircs.2.uriTemplate", "");
pref("gecko.handlerService.schemes.ircs.3.uriTemplate", "");
// メール用のサービス
lockPref("gecko.handlerService.schemes.mailto.0.uriTemplate", "");
lockPref("gecko.handlerService.schemes.mailto.1.uriTemplate", "");
pref("gecko.handlerService.schemes.mailto.2.uriTemplate", "");
pref("gecko.handlerService.schemes.mailto.3.uriTemplate", "");
// カレンダー用のサービス
lockPref("gecko.handlerService.schemes.webcal.0.uriTemplate", "");
pref("gecko.handlerService.schemes.webcal.1.uriTemplate", "");
pref("gecko.handlerService.schemes.webcal.2.uriTemplate", "");
pref("gecko.handlerService.schemes.webcal.3.uriTemplate", "");

// オートコレクト用辞書の取得先 URL
lockPref("browser.dictionaries.download.url", "");

// 位置情報サービスの説明用 URL
lockPref("browser.geolocation.warning.infoURL", "");
// 位置情報を Wi-Fi アクセスポイントから取得するための URL
lockPref("geo.wifi.uri", "");

// SSL の有無が混在しているページでの警告文の URL
lockPref("browser.mixedcontent.warning.infoURL", "");

// 検索プロバイダー (検索エンジン) の自動更新を無効化
lockPref("browser.search.update", false);

// Google Safe Browsing 機能
lockPref("browser.safebrowsing.enabled", false);
lockPref("browser.safebrowsing.malware.enabled", false);
lockPref("browser.safebrowsing.gethashURL", "");
lockPref("browser.safebrowsing.keyURL", "");  // Firefox 38 用
lockPref("browser.safebrowsing.malware", "");  // Firefox 38 用
lockPref("browser.safebrowsing.malware.reportURL", "");
lockPref("browser.safebrowsing.reportErrorURL", "");
lockPref("browser.safebrowsing.reportGenericURL", "");
lockPref("browser.safebrowsing.reportMalwareErrorURL", "");
lockPref("browser.safebrowsing.reportMalwareURL", "");
lockPref("browser.safebrowsing.reportPhishURL", "");
lockPref("browser.safebrowsing.reportURL", "");
lockPref("browser.safebrowsing.updateURL", "");
lockPref("browser.safebrowsing.warning.infoURL", "");  // Firefox 38 用
lockPref("browser.safebrowsing.appRepURL", "");

// 検索プロバイダー (検索エンジン) の取得元 URL
lockPref("browser.search.searchEnginesURL", "");

// 統計情報送信用の機能
lockPref("datareporting.healthreport.service.enabled", false);
lockPref("datareporting.healthreport.uploadEnabled", false);
lockPref("datareporting.healthreport.about.reportUrl", "");
lockPref("datareporting.healthreport.about.reportUrlUnified", "");
lockPref("datareporting.healthreport.documentServerURI", "");
lockPref("datareporting.healthreport.infoURL", "");
lockPref("datareporting.policy.dataSubmissionEnabled", false);

// ウェブアプリケーションのインストールを許可するドメイン
lockPref("dom.mozApps.signed_apps_installable_from", "");

// 危険なアドオンのブロックリスト
lockPref("extensions.blocklist.enabled", false);
lockPref("extensions.blocklist.detailsURL", "");
lockPref("extensions.blocklist.itemURL", "");
lockPref("extensions.blocklist.url", "");

// Mozilla Add-ons から新しいアドオンを検索するのを禁止
lockPref("extensions.getAddons.get.url", "");
lockPref("extensions.getAddons.getWithPerformance.url", "");
lockPref("extensions.getAddons.recommended.url", "");
lockPref("extensions.getAddons.search.browseURL", "");
lockPref("extensions.getAddons.search.url", "");

// アドオンの自動更新
lockPref("extensions.update.enabled", false);
lockPref("extensions.update.background.url", "");
lockPref("extensions.update.url", "");
// Firefox のアップデート後に行われるアドオンの互換性確認を併せて無効化する。
//  (そうしないと、アドオンの互換性確認で Firefox がフリーズしてしまう)
lockPref("extensions.showMismatchUI", false);

// アドオンマネージャーから新しいアドオンを探すための URL
lockPref("extensions.webservice.discoverURL", "");

// パッチ、組み込みのアドオンの更新
lockPref("extensions.systemAddon.update.url", "");

// プラグインのインストール情報、更新情報の取得元 URL
lockPref("pfs.datasource.url", "");
lockPref("plugins.update.url", "");

// UI ツアー
lockPref("browser.uitour.themeOrigin", "");
lockPref("browser.uitour.url", "");

// マルチプロセスモードのフィードバックを促すメッセージ
lockPref("app.feedback.baseURL", "");

// Firefox Sync
lockPref("services.sync.account", "");
lockPref("services.sync.username", "");
lockPref("services.sync.jpake.serverURL", "");
lockPref("services.sync.privacyURL", "");
lockPref("services.sync.serverURL", "");
lockPref("services.sync.statusURL", "");
lockPref("services.sync.syncKeyHelpURL", "");
lockPref("services.sync.termsURL", "");

// Firefox Sync 向けモバイルアプリの宣伝リンク
lockPref("identity.mobilepromo.android", "");
lockPref("identity.mobilepromo.ios", "");

// アドオンの署名義務化に関するメッセージ
lockPref("xpinstall.signatures.devInfoURL", "");

// SNS 連携機能
lockPref("social.enabled", false);  // Firefox 38 用
lockPref("social.activeProviders", "");  // Firefox 45 用
lockPref("social.directories", "");
lockPref("social.shareDirectory", "");
lockPref("social.remote-install.enabled", false);  // Firefox 45 用
lockPref("social.share.activationPanelEnabled", false);  // Firefox 45 用
lockPref("social.toast-notifications.enabled", false);  // Firefox 45 用
lockPref("social.whitelist", "");

// スタートページ
lockPref("startup.homepage_welcome_url", "");
lockPref("startup.homepage_welcome_url.additional", "");

// クラッシュレポーターの関連情報
lockPref("toolkit.crashreporter.infoURL", "");

// 利用状況の統計情報の送信先
lockPref("toolkit.telemetry.enabled", false);
lockPref("toolkit.telemetry.infoURL", "");
lockPref("toolkit.telemetry.server", "");
// 統計情報の送信に関するメッセージの無効化
if (typeof getPref("toolkit.telemetry.prompted") == "boolean")
  clearPref("toolkit.telemetry.prompted");
lockPref("toolkit.telemetry.prompted", 2);
lockPref("toolkit.telemetry.rejected", true);

// ツールバーカスタマイズのヒントにおける詳細情報へのリンク
lockPref("browser.customizemode.tip0.learnMoreUrl", "");

// タイルのパフォーマンス情報
lockPref("browser.newtabpage.enhanced", false);
```

## クラッシュ時の情報を送信させたくない

キーワード: 導入時初期設定、情報漏洩対策

Firefox や Thunderbird がクラッシュすると、通常はクラッシュレポーターが起動し、開発者達が問題を解決するための手がかりとしてクラッシュ時の詳しい情報をサーバーに送信します。また、送信された情報は公開され、誰でも見ることができます。この仕組みによって機密情報が不用意に流出してしまわないように、クラッシュレポーター自体を無効化することができます。

### 送信される情報の内容

どのような情報がクラッシュレポートに付随して送信されるかは、[プライバシーポリシー](https://www.mozilla.jp/legal/privacy/firefox/) を参照してください。送信される内容には、例えば以下のような情報が含まれます。

* Firefox のバージョン、使用言語、使用テーマ、インストールされた日時、起動時間など
* OS の種類、バージョン、メモリーのサイズ、メモリーの空き状況など
* インストールされているアドオンの ID とバージョンの一覧
* クラッシュ時の例外とスタックトレース

端的にいうと、場合によっては個人や組織の特定に繋がりうる情報が含まれることがあります。例えば組織内専用に開発したアドオンを使用している場合、そのアドオンの ID は送信される情報に含まれることとなります。

<!--
書きかけで断念した。
一言説明を書け次第復活する必要がある。

まず、クラッシュレポーターが送信する情報とはどのようなものなのかを説明します。例として、[あるユーザーが Firefox 26 で遭遇したクラッシュについての情報](https://crash-stats.mozilla.com/report/index/a09f9beb-39e7-4706-8e5d-c0be92131222) を見ていきます。

リンク先のページはクラッシュ情報の詳細です。ここには以下の情報が記されています。

* Signature: クラッシュの種類を識別する情報
* UUID: このクラッシュ情報に付けられた一意な ID
* Date Processed: クラッシュ情報が送られた日時
* Uptime: 起動時間
* Last Crash: 前回のクラッシュからの経過時間
* Install Age: Firefox がインストールされてからの経過時間
* Install Time: Firefox がインストールされた日時
* Product: クラッシュした製品 (Firefox)
* Version: Firefox のバージョン
* Build ID: Firefox の詳細なバージョン
* Release Channel: Firefox の自動アップデート対象 (リリース版、ベータ版など)
* OS: OS の種類
* OS Version: OS のバージョン
* Build Architecture: 実行ファイルのビルド対象アーキテクチャ
* Build Architecture Info: 実行ファイルのビルド対象アーキテクチャの詳細
* Crash Reason: クラッシュの理由となった内部的な例外の名前
* Crash Address: クラッシュしたメモリー上のアドレス
* User Comments: クラッシュレポーター上でユーザーが入力したコメント
* App Notes: ビデオドライバのバージョン、Direct 3D などのハードウェアアクセラレーションの対応情報など
* Processor Notes: クラッシュレポートの作成に使われたモジュールの情報
* EMCheckCompatibility: アドオンマネージャーでアドオンの互換性確認機能が有効になっているかどうか
* Winsock LSP: Windows の通信レイヤの詳細な情報
* Adapter Vendor ID: ビデオカードのベンダを識別する ID
* Adapter Device ID: ビデオカードの種類を識別する ID
* Total Virtual Memory: 仮想メモリーの総サイズ
* Available Virtual Memory: 仮想メモリーの利用可能サイズ
* System Memory Use Percentage: システムのメモリーの使用状況 (パーセント)
* Available Page File: 利用可能なスワップファイルのサイズ
* Available Physical Memory: 利用可能な実メモリーのサイズ
* Add-ons: インストールされているアドオンの ID とバージョンの一覧
-->

### 設定方法

クラッシュレポーターを無効化する方法は複数あります。

<!--
http://mxr.mozilla.org/mozilla-central/source/toolkit/crashreporter/nsExceptionHandler.cpp#1861
-->

#### Windows のレジストリを使用する

Windows のレジストリキー `HKEY_LOCAL_MACHINE\Software\Mozilla\Firefox\Crash Reporter` または `HKEY_CURRENT_USER\Software\Mozilla\Firefox\Crash Reporter` について、DWORD 型の値 `SubmitCrashReport` を作成し、データを `0` に設定します。

#### OS X のアプリケーションごとの設定を使用する

`Mozilla Crash Reporter` の設定 `submitReport` について、値を `false` にします。

#### Linux のユーザー固有の設定を使用する

`~/.mozilla/firefox/Crash Reports/crashreporter.ini` の位置に以下の内容のテキストファイルを置きます。

```ini
[Crash Reporter]
SubmitReport＝0
```

#### 環境変数を使用する場合

環境変数 `MOZ_CRASHREPORTER_DISABLE` の値を `1` に設定した状態で Firefox を起動するとクラッシュレポーターが無効化されます。この指定は上記の設定よりも優先され、どのプラットフォームにおいても利用できます。

## 利用時の統計情報を送信させたくない

キーワード: 導入時初期設定、情報漏洩対策

Firefox には、利用時におけるメモリーの使用状況などの性能に関する統計情報を収集してサーバーに送信する機能が含まれています。この仕組みは初期状態で無効化されており、ユーザーの確認の上で有効化されますが、最初から無効の状態に固定しておくことができます。

### 送信される情報の内容

どのような情報が統計情報として送信されるかは、[プライバシーポリシー](https://www.mozilla.jp/legal/privacy/firefox/#telemetry) を参照してください。個人や組織の特定に繋がりうる情報としては、統計情報に付随して IP アドレスが送信されます。

### 設定方法

以下は、統計情報を送信しない設定で固定する場合の、[MCD (AutoConfig)](#mcd) での設定例です。

```js
if (typeof getPref("toolkit.telemetry.prompted") == "boolean")
  clearPref("toolkit.telemetry.prompted");
lockPref("toolkit.telemetry.prompted", 2);
lockPref("toolkit.telemetry.rejected", true);
lockPref("datareporting.healthreport.service.enabled", false);
lockPref("datareporting.healthreport.uploadEnabled", false);
lockPref("datareporting.healthreport.about.reportUrl", "");
lockPref("datareporting.healthreport.about.reportUrlUnified", "");
lockPref("datareporting.healthreport.documentServerURI", "");
lockPref("datareporting.healthreport.infoURL", "");
lockPref("datareporting.policy.dataSubmissionEnabled", false);
```

## フォームのオートコンプリート機能を無効化したい

キーワード: 機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefox のオートコンプリート機能 (テキストボックスに入力した内容を保存しておき、次回以降の入力を省略する機能) は無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
// ウェブページ上のフォーム要素、およびウェブ検索バーのオートコンプリート機能の無効化
lockPref("browser.formfill.enable", false);
```

なお、この設定を反映しても、すでに保存されている入力履歴の削除までは行われません。

## スマートロケーションバーを無効化したい

キーワード: 機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefox のスマートロケーションバー機能 (ロケーションバーから過去の閲覧履歴等を検索する機能) は無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
// スマートロケーションバーのオートコンプリート機能の無効化
lockPref("browser.urlbar.autocomplete.enabled", false);
lockPref("browser.urlbar.maxRichResults", -1);
lockPref("browser.urlbar.suggest.history", false);
lockPref("browser.urlbar.suggest.bookmark", false);
lockPref("browser.urlbar.suggest.openpage", false);
```

なお、この設定を反映しても、すでに保存されている入力履歴や閲覧履歴の削除までは行われません (単に表示されなくなります)。

## パスワードを保存させたくない (パスワードマネージャーを無効化したい)

キーワード: 機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefox および Thunderbird のパスワードマネージャー機能は無効化することができます。

### 設定方法

パスワードマネージャーの利用を禁止する最も簡単な方法は、アドオン [Do Not Save Password][] を使うことです。[管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Do Not Save Password を導入すると、以下の効果を得ることができます。

* パスワードマネージャー機能を無効化し、パスワードの保存を禁止する。
* すでにパスワードマネージャーに保存されてしまっているパスワードをすべて消去する。

また、すでに保存されてしまっているパスワードについては特に削除しなくてもよい (それ以後のパスワードの保存を禁止するのみでよい) のであれば、[MCD (AutoConfig)](#mcd) などを使って以下の設定を反映することによってパスワードマネージャーを無効化できます。

```js
lockPref("signon.rememberSignons", false);
```

## セッション機能を無効化したい

キーワード: 機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefox のセッション関連機能はある程度まで無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
// Firefox 起動時の表示ページの設定。
// 3 にすると前回セッションの復元となるので、それ以外を選択する。
lockPref("browser.startup.page", 0);
// Firefox やアドオンの更新後の再起動などでの 1 回だけのセッション復元を禁止する
lockPref("browser.sessionstore.resume_session_once", false);
// クラッシュからの復帰時の自動的なセッション復元を禁止する
lockPref("browser.sessionstore.max_resumed_crash", -1);
lockPref("browser.sessionstore.resume_from_crash", false);
// 閉じたタブを開き直す機能を無効化する
lockPref("browser.sessionstore.max_tabs_undo", 0);
// 閉じたウィンドウを開き直す機能を無効化する
lockPref("browser.sessionstore.max_windows_undo", 0);
// フォームの入力内容などのプライバシー情報を保存させない
lockPref("browser.sessionstore.privacy_level", 2);
lockPref("browser.sessionstore.privacy_level_deferred", 2);
```

この設定により、ディスク上に保存されるセッション情報は最小限のものとなります。

### 注意事項

現在のバージョンの Firefox では、セッション管理機構自体を無効化することはできません。`about:home` での「以前のセッションを復元」機能のために、前回のセッション情報は常にディスク上に保存されます。

セッションを一切保存しないようにすることはできませんが、[globalChrome.css][] を使うなどしてボタンを非表示にして、セッションを復元する手段へのアクセスを禁じることはできます。globalChrome.css を使う場合の手順は以下の通りです。

1. 「メモ帳」などのテキストエディターを開き、以下のスタイル指定を記述します。

    ```css
    @-moz-document url-prefix("chrome://browser/content/browser.xul") {
      #historyRestoreLastSession,
      #appMenuRestoreLastSession {
        visibility: collapse !important;
        -moz-user-focus: ignore !important;
      }
    }
    @-moz-document url-prefix("about:home"),
                   url-prefix("chrome://browser/content/abouthome/aboutHome.xhtml") {
      *|*#restorePreviousSessionSeparator,
      *|*#restorePreviousSession,
      *|*[id="restorePreviousSessionSeparator"],
      *|*[id="restorePreviousSession"] {
        display: none !important;
      }
    }
    ```

    (`@-moz-document` は、特定のウィンドウに対してのみスタイル指定を反映させるための記述です。詳細は [@-moz-document について参考][] を参照してください。)
2. 1 で作成した内容を `globalChrome.css` という名前のプレーンテキストファイルに保存します。
3. 2 で作成したファイルを Firefox のインストール先の `chrome` フォルダーに設置します (Windows Vista 以降の場合のファイルの設置場所は `C:\Program Files (x86)\Mozilla Firefox\chrome\globalChrome.css` となる)。
4. [管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って [globalChrome.css][] を導入します。

ただしこの場合においても、単にユーザーが手動操作でセッションを復元できなくなるだけであり、ディスク上にはセッション情報が依然として保存される状態であることにはご注意ください。

## 検索エンジン (Google など) の候補の推測表示を無効化したい

キーワード: 機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefox のウェブ検索バーは Google などの検索における検索語句の候補の表示に対応していますが、この機能は無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
lockPref("browser.search.suggest.enabled", false);
```

## 位置情報取得 API (Geolocation) を無効化したい

キーワード: 機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefox は地図などのウェブサービスに対して現在位置の情報を通知する機能を含んでいますが、この機能は無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
lockPref("geo.enabled", false);
```

# ユーザーが使える機能を制限したい

## 一部のキーボードショートカットを無効化したい {#disable-keyboard-shortcuts}

キーワード: 機能制限、導入時初期設定、集中管理

Firefox はキーボードショートカットを管理する機能を含んでいませんが、アドオンを使うことによって、キーボードショートカットの割り当てを変更したりショートカットを無効化したりできます。

本項では、管理者が行った設定を全体に展開する用途を想定して、[UI Text Overrider][] を使った設定の手順を解説します。

### 設定方法

大まかな手順は以下の通りです。

1. [DOM Inspector][] をインストールします。
2. [ツール] > [ウェブ開発] > [DOM Inspector] で DOM Inspector を起動します。
3. [File] > [Inspect Chrome Document] を選択し、ブラウザーのウィンドウのタイトルと同じ項目を選択します。
4. `<window>` 直下の `<keyset id="devtoolsKeyset">` や `<keyset id="mainKeyset">` を選択し、サブツリーを展開します。
5. `<keyset>` 直下に多数ある `<key>` から目的のショートカットを定義しているものを見つけ出します。
6. [MCD (AutoConfig)](#mcd) を使用し、UI Text Overrider で当該ショートカットを無効化するための設定を行います。
7. [管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って UI Text Overrider を導入します。

Ctrl-T (新しいタブを開く) に対応する `<key>` を例として、4 および 5 の詳細な手順を説明します。以下は Ctrl-T のショートカットを定義している `<key>` です。

```xml
<key id="key_newNavigatorTab"
     key="t"
     modifiers="accel"
     command="cmd_newNavigatorTab"/>
```

`<key>` は、`key` または `keycode` のいずれかの属性を持ちます。アルファベットや記号など通常の文字入力用のキーを使うショートカットでは `key` 属性の値にそのキーの文字が指定されており、F1 などのファンクションキーや Tab、BackSpace などの特殊なキーを使うショートカットでは `keycode` 属性の値にそのキーの仮想キーコード名 (`VK_TAB` や `VK_BACK` など。一覧は [KeyboardEvent - Web API interfaces](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Virtual_key_codes) を参照してください) が指定されています。

また、Ctrl キーなどの修飾キーを伴うショートカットでは、 `modifiers` 属性に修飾キーが指定されています。`modifiers` 属性の値は修飾キー名のカンマ区切りのリストで、`alt`、`control`、`meta` (Mac の Command キーに対応)、`shift`、および `accel` (Mac では `meta` と見なされ、それ以外の環境では `control` と見なされる) のうちの 1 つ以上の組み合わせとなります。

上記の情報を手がかりにして、挙動を変えたいキーボードショートカットに対応する `<key>` を探します。見つかったら、それを無効化するための設定を [MCD (AutoConfig)](#mcd) の設定ファイルに記述します。凡例は以下の通りです。

```js
lockPref("extensions.uitextoverrider@clear-code.com.<定義名>",
  "要素を特定するための CSS セレクタ");
lockPref("extensions.uitextoverrider@clear-code.com.<定義名>.<属性名 1>",
  "値");
lockPref("extensions.uitextoverrider@clear-code.com.<定義名>.<属性名 2>",
  "値");
...
```

先の Ctrl-T を無効化する場合は、以下のようになります。

```js
lockPref("extensions.uitextoverrider@clear-code.com.newNavigatorTab",
  "#key_newNavigatorTab"); // ID セレクタを使用
lockPref("extensions.uitextoverrider@clear-code.com.newNavigatorTab.disabled",
  "true"); // disabled 属性を true に設定し、ショートカットを無効化する
lockPref("extensions.uitextoverrider@clear-code.com.newNavigatorTab.command",
  ""); // コマンドの割り当てを無くし、万が一にも動作しないようにする
```

### 注意事項

UI Text Overrider を使った方法では、挙動を変更できるのは Firefox の UI 上で `<key>` が定義されているキーボートショートカットのみとなります。例えば以下のようなショートカットは挙動を変更できません。

* Ctrl-←、→、↑、↓
* Ctrl-F4 (ウィンドウまたはタブを閉じる)
* F7 (キャレットブラウズモードを切り替える)
* Alt (メニューバーを表示する)
* F10 (メニューバーにフォーカスする)
* Home (ページ先頭にスクロールする)
* End (ページ末尾にスクロールする)

このようなショートカットを無効化するためには、userChrome.js スクリプトや独自開発のアドオンなどを使う必要があります。

## 一部のメニュー項目やツールバーボタンなどの UI 要素を非表示にしたい {#hide-ui-elements}

キーワード: 機能制限、導入時初期設定、集中管理

アドオンを使うことで、Firefox の特定の UI 要素を画面上に表示しないようにしてユーザーによる操作を禁止することができます。

### 設定方法

UI 要素を隠すためには、[globalChrome.css][] などのアドオンを使って UI 要素を隠すスタイル指定を適用する必要があります。globalChrome.css を使う場合の手順は以下の通りです。

1. [DOM Inspector][] をインストールします。
2. [ツール] > [ウェブ開発] > [DOM Inspector] で DOM Inspector を起動します。
3. [File] > [Inspect Chrome Document] を選択し、ブラウザーのウィンドウのタイトルと同じ項目を選択します。
4. ツリーを展開していくか、もしくはツールバーの左端にある [Find a node to inspect by clicking on it] ボタンをクリックした後にブラウザーウィンドウの非表示にしたい UI 要素をクリックするかして、非表示にしたい UI 要素の詳細を表示します。
5. UI 要素の ID もしくは他の要素と類似していない特徴を調べる。
6. 「メモ帳」などのテキストエディターを開き、4 で調べた情報を使って項目を非表示にするスタイル指定を記述します。以下は メニューバーを非表示にする場合の例。

    ```css
    @-moz-document url-prefix(chrome://browser/content/browser.xul) {
      #toolbar-menubar,
      #toolbar-menubar * /* 子孫要素も同様に非表示および無効化する */ {
        /* display:none は DOM ツリーに変化を与えて挙動を壊す恐れがあるため、
           単に非表示にするのみとする。 */
        visibility: collapse !important;
        -moz-user-focus: ignore !important;
      }
    }
    ```

    (`@-moz-document` は、特定のウィンドウに対してのみスタイル指定を反映させるための記述です。詳細は [@-moz-document について参考][] を参照してください。)
7. 6 で作成した内容を `globalChrome.css` という名前のプレーンテキストファイルに保存します。
8. 7 で作成したファイルを Firefox (Thunderbird) のインストール先の `chrome` フォルダーに設置します (Windows Vista 以降の場合のファイルの設置場所は `C:\Program Files (x86)\Mozilla Firefox\chrome\globalChrome.css` となる)。
9. [管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って [globalChrome.css][] を導入します。

## プライベートブラウジング機能を使わせたくない

キーワード: 機能制限、情報漏洩対策

プライベートブラウジング機能へのアクセス経路を無効化することで、ユーザーのプライベートブラウジング機能の利用を禁止できます。

### ウィザードでの実現

[CCK2 Wizard](#cck) を使用すると、プライベートブラウジング機能の利用を禁止する機能を含むアドオンを作成することができます。

### MCD用設定ファイルでの実現

[MCD (AutoConfig)](#mcd) を使い、プライベートブラウジングモードで起動する機能を無効化します。設定は以下の通りです。

```js
lockPref("browser.privatebrowsing.autostart", false);
```

[一部のメニュー項目やツールバーボタンなどのUI要素を非表示にしたい](#hide-ui-elements) の手順に則り、プライベートブラウジングを開始するためのメニュー項目を非表示にします。[globalChrome.css][] を使う場合の設定は以下の通りです。

```css
@-moz-document url-prefix(chrome://browser/content/browser.xul) {
  #menu_newPrivateWindow,
  #privatebrowsing-button,
  #wrapper-privatebrowsing-button,
  #key_privatebrowsing,
  #Tools\:PrivateBrowsing,
  #context-openlinkprivate {
    visibility: collapse !important;
    -moz-user-focus: ignore !important;
  }
}
```

[一部のキーボードショートカットを無効化したい](#disable-keyboard-shortcuts) の手順に則り、プライベートブラウジングを開始するためのキーボードショートカットを無効化します。[UI Text Overrider][] と [MCD (AutoConfig)](#mcd) を併用する場合の設定は以下の通りです。

```js
lockPref("extensions.uitextoverrider@clear-code.com.privateBrowsing",
  "#key_privatebrowsing");
lockPref("extensions.uitextoverrider@clear-code.com.privateBrowsing.disabled",
  "true");
lockPref("extensions.uitextoverrider@clear-code.com.privateBrowsing.command",
  "");
```

また、[CCK2 Wizard](#cck) でも同様のカスタマイズが可能です。

## Firefox Sync を使わせたくない

キーワード: 機能制限、導入時初期設定、集中管理

無用なトラブルや情報の流出を避けるため、ユーザーが任意に Firefox Sync をセットアップできないよう設定することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck) を使用すると、Firefox Sync の利用を禁止する機能を含むアドオンを作成することができます。

### MCD 用設定ファイルでの実現

CCK2 Wizard 以外で Firefox Sync の利用を禁止する方法としては、アドオン [Disable Sync][] を使う方法があります。[管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Disable Sync を導入すると、以下の操作が完全に禁止されます。

* ユーザーが Firefox Sync の初期設定を行う。
* ユーザーが Firefox Sync のツールバーボタンを追加する。
* ユーザーが手動で情報を同期する。
* Firefox が自動的に情報を同期する。

[CCK2 Wizard](#cck) でも同様のカスタマイズが可能です。

また、単に通信を無効化するだけであれば、[MCD (AutoConfig)](#mcd) などを使って以下の設定を反映することによっても実現可能です。

```js
lockPref("services.sync.serverURL", "");
lockPref("services.sync.jpake.serverURL", "");
lockPref("services.sync.termsURL", "");
lockPref("services.sync.privacyURL", "");
lockPref("services.sync.statusURL", "");
lockPref("services.sync.syncKeyHelpURL", "");
```

### 注意事項

Disable Sync は、すでに同期済みの設定を消去しません。すでにユーザーが Firefox Sync を利用しており、サーバーおよび他のクライアントに設定を同期している場合、それらは別途削除する必要があります。

# 自動アップデート

## Firefox・Thunderbird の自動アップデートを禁止したい

キーワード: 機能制限、集中管理、自動アップデート

無用なトラブルを避けるため、ユーザーが使用中に Firefox や Thunderbird が自動アップデートを行わないよう設定することができます。

### 設定方法

Firefox や Thunderbird の自動アップデートを禁止する最も簡単な方法は、アドオン [Disable Auto Update][] を使うことです。[管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Disable Auto Update を導入すると、以下の機能が完全に無効化されます。

* Firefox および Thunderbird が定期的に自身のアップデート情報を取得する。
* Firefox が検索エンジンの自動アップデート情報を取得する。
* 「オプション」から自動アップデートの設定を変更する。

また、単に自動アップデート情報の取得処理を無効化するだけであれば、[MCD (AutoConfig)](#mcd) などを使って以下の設定を反映することによっても実現可能です。

```js
lockPref("app.update.auto", false);
lockPref("app.update.enabled", false);
lockPref("browser.search.update", false);
```

## Firefox・Thunderbird の自動アップデートについて、メジャーアップデートは禁止し、マイナーアップデートのみ自動で適用したい

キーワード: 機能制限、集中管理、自動アップデート

Firefox や Thunderbird の ESR 版は通常、あるメジャーバージョンのサポートが終了すると、自動アップデート経由で次のメジャーバージョンにアップデートされます。例えば Firefox 17.0.11 ESR は、順次 Firefox 24 ESR へアップデートされます。

このようなメジャーバージョンの変更を伴う自動アップデートの適用を禁止し、マイナーバージョンの変更のみを適用するよう設定することができます。

### 設定方法

Firefox や Thunderbird のメジャーアップデートを禁止する最も簡単な方法は、アドオン [Only Minor Update][] を使うことです。[管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Only Minor Update を導入すると、メジャーバージョンが異なるアップデートは適用されないようになります。

### 注意事項

このアドオンは、内部的に `app.update.url.override` を上書きします。そのため、この設定を用いて自動アップデート情報の提供元を変更するカスタマイズとの併用はできません。自動アップデート情報の提供元を変更する場合は、提供する自動アップデート情報の側で、マイナーアップデートの情報のみを提供する形で運用してください。

## Firefox・Thunderbird の自動アップデートの提供タイミングを組織内で制御したい

キーワード: 機能制限、集中管理、自動アップデート

通常、Firefox や Thunderbird は Mozilla が公式に提供しているアップデート情報に基づいて自動アップデートを行いますが、設定変更により、組織内のサーバーなどをアップデート情報の提供元にすることができます。これにより、自動アップデートの適用タイミングを制御できます。

### 設定方法

<!--
`app.update.url` に `update.xml` の URL を指定する場合、ユーザー設定では反映されず、AutoConfig を使い `defaultPref`/`lockPref` で認識させる必要がある。
    URL には `https:` のみ利用できる。`http:`、`ftp:`、`file:` などは利用できない。
    http://mxr.mozilla.org/mozilla-central/source/toolkit/mozapps/update/nsUpdateService.js#3150
    (http://mxr.mozilla.org/mozilla-esr17/source/toolkit/mozapps/update/nsUpdateService.js#2806)
    http://mxr.mozilla.org/mozilla-central/source/toolkit/mozapps/shared/CertUtils.jsm#142
    (http://mxr.mozilla.org/mozilla-esr17/source/toolkit/mozapps/shared/CertUtils.jsm#142)
    ビルトインのルート証明書で検証できる証明書か、もしくは、独自の証明書が必要。独自の証明書を使う場合は `app.update.cert.requireBuiltIn=false` にする。
    それ以外は拒否されてしまう。
    `update.xml` から指定するアップデート用ファイルの URL は、`http` または `https` でなければならない。
    http://mxr.mozilla.org/mozilla-esr17/source/netwerk/base/src/nsIncrementalDownload.cpp#503
    ローカルファイル、FTP などは使えない。
この方法は説明が煩雑なので紹介しない。
-->

Firefox 24.1.1 ESR が導入済みのクライアントを Firefox 24.2.0 ESR に更新するための情報およびファイルを静的なファイルとして提供する場合を例として、手順を説明します。

1. アップデート用のアーカイブファイルを Mozilla の FTP サーバーから入手します。
    * FTP サーバー上には各バージョンのアップデート用差分ファイル、完全アップデート用アーカイブファイルが保存されており、以下のような URL でダウンロードすることができます。[https://archive.mozilla.org/pub/firefox/releases/24.2.0esr/update/win32/ja/](https://archive.mozilla.org/pub/firefox/releases/24.2.0esr/update/win32/ja/)
    * ファイル名に `partial` と付いているものは差分アップデート用ファイル、`completet` と付いているものは完全アップデート用ファイルです。差分アップデート用ファイルはファイル名で示されている更新前バージョンに対してのみ適用できます。
2. 1 でダウンロードしたファイルを、自組織内からアクセスできる HTTP サーバー上に設置します。Samba サーバー上のファイルにファイルとしてアクセスする形態や、ローカルのファイルシステムにマウントしてファイルとしてアクセスする形態では利用できず、あくまで HTTP 経由でダウンロードできる状態にしておく必要があります。
3. 以下のような内容で、自動アップデート情報提供用の XML ファイル `update.xml` を用意します。

    ```xml
    <?xml version="1.0"?>
    <updates>
      <update type="minor"
              displayVersion="更新後バージョン番号の表示名"
              appVersion="更新後バージョン番号"
              platformVersion="更新後バージョン番号"
              buildID="更新後バージョンのビルド ID"
              actions="silent">
        <patch type="complete"
               URL="mar ファイルのダウンロード用 URL"
               hashFunction="ハッシュ関数の種類"
               hashValue="mar ファイルのハッシュ"/>
      </update>
    </updates>
    ```

    例えば Firefox 24.2 ESR への更新で、ハッシュを SHA-512 で用意するのあれば、以下のようになります。

    ```xml
    <?xml version="1.0"?>
    <updates>
      <update type="minor"
              displayVersion="24.2.0esr"
              appVersion="24.2.0"
              platformVersion="24.2.0"
              buildID="20131205180928"
              actions="silent">
        <patch type="complete"
               URL="mar ファイルのダウンロード用 URL"
               hashFunction="SHA512"
               hashValue="mar ファイルの SHA-512 ハッシュ"/>
      </update>
    </updates>
    ```

4. 3 で用意したファイルをクライアント上のローカルファイル、ファイル共有サーバー上のファイル、HTTP サーバー上のファイルのいずれかの形で設置し、クライアントから取得できるようにします。
5. [MCD (AutoConfig)](#mcd) などを使って、文字列型の設定 `app.update.url.override` の*ユーザー設定値*に 4 で設置したファイルの URL 文字列を指定します。
    * ローカルファイルやファイル共有サーバー上のファイルである場合は、`file:///` から始まるファイル URL を指定します。
    * MCD を使う場合、ディレクティブとしては `lockPref()` や `defaultPref()` ではなく `pref()` を使用します。

以上で更新情報の提供準備ならびにクライアントの設定は完了です。以後は、サーバー上に設置した `update.xml` ならびにアップデート用のアーカイブファイルを適宜更新するようにしてください。

詳細な情報は [更新サーバーの設定 - Mozilla | MDN](https://developer.mozilla.org/ja/docs/Mozilla/Setting_up_an_update_server) を参照してください。

### 確認方法

以下の通り設定を変更すると、自動アップデートの処理が 10 秒ごとに行われるようになります。この状態で「エラーコンソール」もしくは「ブラウザーコンソール」を表示すると、自動アップデート処理の詳細なログが表示されます。更新情報の取得に成功しているかどうか、取得した更新情報の読み込みに成功しているかどうかなどを確認するのに利用できます。

* `app.update.timerMinimumDelay` (整数): `10`
* `app.update.promptWaitTime` (整数): `1`
* `app.update.interval` (整数): `10`
* `app.update.log` (真偽): `true`
* `app.update.log.all` (真偽): `true`

### 注意事項

上記手順での設定後は、SSL を使用しない限り、更新情報の提供元自体が正しいかどうか (中間者攻撃を受けていないかどうか) の検証は行われない状態となります。信頼できないネットワークを経由する場合は、SSL を使って安全に更新情報を取得できるようにしてください。

## 自動アップデート機能を使わずに Firefox・Thunderbird を差分更新したい

キーワード: 自動アップデート

Firefox や Thunderbird の自動アップデート機能は、通常のインストーラよりも遙かに小さい差分ファイルをダウンロードしてアプリケーションを更新するようになっています。この差分更新用のファイルを使った差分更新処理は、自動アップデート機能を使わずとも、任意のタイミングで実行することができます。これにより、自動アップデート機能自体は無効にしておきつつ、必要に応じてシステムのログオンスクリプトを使って任意のタイミングでの差分更新を適用する、という形での運用が可能です。

### 差分ファイルの入手

差分アップデートの適用時には、アップデート用差分ファイルを公式の FTP サイトから入手する必要があります。URL の凡例は以下の通りです。

```
https://archive.mozilla.org/pub/[製品名]/releases/[アップデート先バージョン]/update/win32/ja/[製品名]-[アップデート元バージョン]-[アップデート先バージョン].partial.mar
```

例えば Firefox 30 から Firefox 31 へアップデートする場合に必要な差分ファイルは以下の場所から入手できます。

```
https://archive.mozilla.org/pub/firefox/releases/31.0/update/win32/ja/firefox-30.0-31.0.partial.mar
```

差分ファイルによるアップデートを行うには、現在インストールされている Firefox のバージョンに対応した差分ファイルが必要となります。差分ファイルが想定する「アップデート前のバージョン」が現在インストールされている Firefox のバージョンに一致しない場合、差分アップデートは行えません。

通常、公式の FTP サイトでは特定バージョンの Firefox に対して、それ以前のいくつかのバージョンからの差分アップデート用のファイルのみが配布されています。差分ファイルが用意されていないパターン、例えば Firefox 25.0 から Firefox 31 へアップデートするというような、間のバージョンを多数飛ばしたアップデートは原則として行えないものとご理解ください。

### 差分更新の適用手順の凡例

Firefox の差分更新用ファイルを用いて際の手順は以下の通りです。

1. 管理者権限でコマンドプロンプトを起動する。Windows XP の場合、Administrator 権限のあるユーザーでコマンドプロンプトを起動する。Windows Vista 以降の場合、スタートメニューの [すべてのプログラム] > [アクセサリ] > [コマンド プロンプト] を右クリックして [管理者として実行] を選択する。
2. 先の方法で入手した差分アップデート用のファイル (`firefox-*-*.partial.mar`) を作業ディレクトリーに `update.mar` というファイル名で配置する。

    ```sh
    > copy firefox-*.partial.mar "<作業ディレクトリーのパス>\update.mar"
    ```

3. Firefox のインストール先フォルダーにある `updater.exe` を作業ディレクトリーにコピーする。

    ```sh
    > copy "<Firefox のインストール先フォルダーのパス>\updater.exe"
        "<作業ディレクトリーのパス>\updater.exe"
    ```

4. 作業ディレクトリーに配置した `updater.exe` を、差分アップデート用のファイルがあるディレクトリー (ここでは作業ディレクトリーと同じ) のフルパスを第 1 引数、Firefox のインストール先フォルダーのフルパスを第 2 引数、`updater.exe` が動作する際の作業フォルダーのパス (= Firefox のインストール先フォルダー) のフルパスを第 3 引数して渡して起動する。

    ```sh
    > cd "<作業ディレクトリーのパス>"
    > "<作業ディレクトリーのパス>\updater.exe" "<差分アップデート用のファイルがあるディレクトリーのフルパス>" "<Firefox のインストール先フォルダーのフルパス>" "<Firefox のインストール先フォルダーのフルパス>"
    ```

5. アップデートの適用結果を確認する。作業ディレクトリーに出力された `update.status` の内容が `succeeded` であれば、アップデートに成功している。そうでない場合は、アップデートの適用に失敗している。
6. アンインストール情報を更新する。`update.log` を Firefox のインストール先フォルダーの `uninstall` フォルダー内に `uninstall.update` というファイル名でコピーする。

    ```sh
    > copy /Y update.log "<Firefox のインストール先フォルダーのパス>\uninstall\uinstall.update"
    ```

7. アップデートの後処理を実行する。Firefox のインストール先フォルダーの `uninstall` フォルダーにある `helper.exe` を、`/PostUpdate` オプションを指定して実行する。

    ```sh
    > "<Firefox のインストール先フォルダーのパス>\uninstall\helper.exe" /PostUpdate
    ```

    これにより、レジストリ内の Firefox のバージョンなどの情報が更新される。

以上で、差分アップデートの適用は完了です。

### 差分更新の適用例

本項では、例として以下のバージョンにおける差分更新の適用時の具体的な手順を示します。

* 現在 Firefox 30 がインストールされている。
* Firefox 31 へアップデートする。
* 作業ディレクトリーは `C:\temp` とする。
* Firefox のインストール先は `C:\Program Files (x86)\Mozilla Firefox` とする。

1. 管理者権限でコマンドプロンプトを起動する。
2. 差分アップデート用のファイルを作業ディレクトリーに `update.mar` というファイル名で配置する。

    ```sh
    > copy firefox-30.0-31.0.partial.mar "C:\temp\update.mar"
    ```

3. Firefox のインストール先フォルダーにある `updater.exe` を作業ディレクトリーにコピーする。

    ```sh
    > copy "C:\Program Files (x86)\Mozilla Firefox\updater.exe"
        "C:\temp\updater.exe"
    ```

4. 作業ディレクトリーに配置した `updater.exe` を、作業ディレクトリーのフルパスを第 1 引数、Firefox のインストール先フォルダーのフルパスを第 2 引数と第 3 引数として渡して起動する。

    ```sh
    > cd c:\temp
    > updater.exe "C:\temp" "C:\Program Files (x86)\Mozilla Firefox" "C:\Program Files (x86)\Mozilla Firefox"
    ```

5. アップデートの適用結果を確認する。

    ```sh
    > type update.status
    ```

以上で、差分アップデートの適用は完了です。

## アドオンの自動アップデートの提供タイミングを組織内で制御したい

キーワード: 機能制限、集中管理、自動アップデート、アドオン

通常、Firefox や Thunderbird は Mozilla が公式に提供しているアドオンのアップデート情報に基づいてアドオンの自動アップデートを行いますが、設定変更により、組織内のサーバーなどをアップデート情報の提供元にすることができます。これにより、アドオンの自動アップデートの適用タイミングを制御できます。

### 設定方法

1. 以下のような内容で、自動アップデート情報提供用の XML ファイル `update.rdf` を用意します。

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <RDF:RDF xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:em="http://www.mozilla.org/2004/em-rdf#">
      <RDF:Description about="urn:mozilla:extension:アドオンの ID">
        <em:updates>
          <RDF:Seq>
            <RDF:li>
              <RDF:Description>
                <em:version>アドオンのバージョン</em:version>
                <em:targetApplication>
                  <RDF:Description>
                    <em:id>対象アプリケーションの ID</em:id>
                    <em:minVersion>最小バージョン</em:minVersion>
                    <em:maxVersion>最大バージョン</em:maxVersion>
                    <em:updateLink>XPI ファイルのダウンロード用URL</em:updateLink>
                    <em:updateHash>ハッシュ関数名: XPI ファイルのハッシュ値</em:updateHash>
                  </RDF:Description>
                </em:targetApplication>
              </RDF:Description>
            </RDF:li>
          </RDF:Seq>
        </em:updates>
      </RDF:Description>
    </RDF:RDF>

    ```
    例えば Firefox 24.2 ESR 向けのアドオンとして [DOM Inspector][] の更新情報を提供するのであれば以下のようになります。

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <RDF:RDF xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:em="http://www.mozilla.org/2004/em-rdf#">
      <RDF:Description about="urn:mozilla:extension:inspector@mozilla.org">
        <em:updates>
          <RDF:Seq>
            <RDF:li>
              <RDF:Description>
                <em:version>2.0.14</em:version>
                <em:targetApplication>
                  <RDF:Description>
                    <em:id>{3550f703-e582-4d05-9a08-453d09bdfdc6}</em:id>
                    <em:minVersion>24.0</em:minVersion>
                    <em:maxVersion>24.*</em:maxVersion>
                    <em:updateLink>http://..../dominspector.xpi</em:updateLink>
                    <em:updateHash>sha1: ファイルの SHA-1 ハッシュ</em:updateHash>
                  </RDF:Description>
                </em:targetApplication>
              </RDF:Description>
            </RDF:li>
          </RDF:Seq>
        </em:updates>
      </RDF:Description>
    </RDF:RDF>
    ```

2. 1 で用意したファイルをクライアント上のローカルファイル、ファイル共有サーバー上のファイル、HTTP サーバー上のファイルのいずれかの形で設置し、クライアントから取得できるようにします。
3. [MCD (AutoConfig)](#mcd) などを使って、文字列型の設定 `extensions.update.url` の値に、2 で設置したファイルの URL 文字列を指定します。

以上で更新情報の提供準備ならびにクライアントの設定は完了です。以後は、サーバー上に設置した `update.rdf` ならびに各アドオンの XPI ファイルを適宜更新するようにしてください。

詳細な情報は [Extension Versioning, Update and Compatibility | MDN](https://developer.mozilla.org/ja/docs/Extension_Versioning,_Update_and_Compatibility#.E3.82.A2.E3.83.83.E3.83.97.E3.83.87.E3.83.BC.E3.83.88_RDF_.E3.81.AE.E5.BD.A2.E5.BC.8F) を参照してください。

### 確認方法

以下の通り設定を変更すると、アドオンの自動アップデートの処理が 10 秒ごとに行われるようになります。この状態で「エラーコンソール」もしくは「ブラウザーコンソール」を表示すると、自動アップデート処理の詳細なログが表示されます。更新情報の取得に成功しているかどうか、取得した更新情報の読み込みに成功しているかどうかなどを確認するのに利用できます。

* `app.update.timerMinimumDelay` (整数): `10`
* `extensions.update.interval` (整数): `10`
* `extensions.logging.enabled` (真偽): `true`

### 注意事項

上記手順での設定後は、SSL を使用しない限り、更新情報の提供元自体が正しいかどうか (中間者攻撃を受けていないかどうか) の検証は行われない状態となります。信頼できないネットワークを経由する場合は、SSL を使って安全に更新情報を取得できるようにしてください。

# ユーザーを惑わすメッセージを表示させたくない

## 初回起動時の設定移行ウィザードを表示させたくない

キーワード: 導入時初期設定

Firefox や Thunderbird の初回起動時に表示される `設定移行ウィザード` (他のアプリケーションの設定を引き継ぐためのウィザード) は無効化することができます。

### 設定方法

`override.ini` という名前で以下の内容のテキストファイルを作成し、Firefox であればインストール先ディレクトリー内の `browser` ディレクトリー内 (Windows であれば `C:\Program Files (x86)\Mozilla Firefox\browser\override.ini` など)、Thunderbird であればインストール先ディレクトリー直下 (Windows であれば `C:\Program Files (x86)\Mozilla Thunderbird\override.ini` など) に置きます。

```ini
[XRE]
EnableProfileMigrator=false
```

## アップデート後の「お使いの Firefox は最新版に更新されました」タブを表示させたくない

キーワード: 導入時初期設定

Firefox を更新した後の初回起動時に表示される「お使いの Firefox は最新版に更新されました」タブは、設定で無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
lockPref("browser.startup.homepage_override.mstone", "ignore");
```

## アップデート後の「Thunderbird へようこそ」 (新着情報) タブを表示させたくない

キーワード: 導入時初期設定

Thunderbird を更新した後の初回起動時に表示される「Thunderbird へようこそ」タブは、設定で無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
clearPref("app.update.postupdate");
```

上記の設定は、設定値の内容に関わらず、ユーザー設定値が保存されていると「Thunderbird へようこそ」タブが開かれるという仕様になっています。そのため、明示的に `false` を指定する代わりにユーザー設定値を消去する必要があります。

## 「あなたの権利について」を表示させたくない

キーワード: 導入時初期設定

Firefox や Thunderbird の初回起動時などに表示される「あなたの権利について」のメッセージは、設定で無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。Firefox と Thunderbird で設定名が異なることに注意してください。

```js
// Firefox の場合
lockPref("browser.rights.override", true);

// Thunderbird の場合
lockPref("mail.rights.override", true);
```

## パフォーマンス情報の自動送信に関するメッセージを表示させたくない

キーワード: 導入時初期設定

Firefox や Thunderbird の初回起動時などに表示される「Mozilla Firefox (Thunderbird) の改善のため、メモリー消費量、パフォーマンス、応答速度を自動的に Mozilla に送信しますか？」のメッセージは、設定で無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。設定名は Firefox と Thunderbird で共通です。

```js
if (typeof getPref("toolkit.telemetry.prompted") == "boolean")
  clearPref("toolkit.telemetry.prompted");
lockPref("toolkit.telemetry.prompted", 2);
```

上記のメッセージが表示された際に「いいえ」を選択した状態にしたい場合 (パフォーマンス情報の自動送信を禁止したい場合) は、以下も併せて指定します。

```js
lockPref("toolkit.telemetry.enabled", false);
lockPref("toolkit.telemetry.rejected", true);
```

<!--
## ダウンロード完了の通知を表示させたくない (未稿)
  autoconfig
旧ダウンロードマネージャーが廃止されたので、これはこのままでは書けない気がする。
何のために通知を表示させたくないのか、ということを汲み取って、新しい UI でその目的を達成するためのカスタマイズを考える必要がある。
-->

## プラグインのインストールを促すメッセージを表示させたくない

キーワード: 導入時初期設定

Firefox で Flash や Java などのプラグインを使用したページを閲覧する際に表示される、プラグインのインストールを促すメッセージは、設定で無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
lockPref("plugins.hide_infobar_for_missing_plugin", true);
```

<!--
lockPref("plugins.hide_infobar_for_outdated_plugin", true);
`plugins.hide_infobar_for_outdated_plugin` は、現在の Firefox では対応する実装が存在していない模様。
-->

## タブを閉じようとしたときの警告を表示させたくない

キーワード: 導入時初期設定

Firefox でウィンドウや複数のタブを一度に閉じようとした時に表示される、本当に閉じてもよいかどうかの確認ダイアログは、設定で無効化することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
// 複数のタブを開いた状態でウィンドウを閉じようとした時の確認を表示しない
lockPref("browser.tabs.warnOnClose", false);
// 「他のタブを閉じる」で複数のタブを一度に閉じようとした時の確認を表示しない
lockPref("browser.tabs.warnOnCloseOtherTabs", false);
```

# 初期設定の変更

## 既定のホームページを変更したい

キーワード: 導入時初期設定

Firefox を起動した時に表示される最初のページはユーザーが自由に変更できますが、変更するまでの間は初期設定が使われ、また、`初期設定に戻す` で最初の状態に戻すことができます。この時の初期設定として使われるページは変更することができます。

### 設定方法

設定ファイルを使用して任意のブックマーク項目を初期状態に追加する手順は以下の通りです。

1. 後述する内容で、テキストファイル `distribution.ini` を作成します。
2. Firefox の実行ファイルと同じ位置に `distribution` という名前でフォルダーを作成します。Firefox が `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、作成するフォルダーのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution` となります。
3. 1 で作成したフォルダーの中に `distribution.ini` を設置します。最終的なファイルのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution\distribution.ini` となります。

`distribution.ini` の内容は以下の要領で記述します。なお、日本語を記述する場合は文字エンコーディングを UTF-8 にしてファイルを保存してください。

```ini
[Global]
; カスタマイズ済み Firefox を識別する一意な名前。
id=our-customized-firefox
; カスタマイズのバージョン。
version=1.0
; 「Mozilla Firefox について」に表示される説明文。
about=Customized Version

[LocalizablePreferences]
; 必ず以下の 2 項目をセットで指定する。
browser.startup.homepage="https://www.mozilla.jp/"
browser.startup.homepage_reset="https://www.mozilla.jp/"
```

また、[CCK2 Wizard](#cck) でも同様のカスタマイズが可能です。

## 初期状態のブックマークの内容を変更したい

キーワード: 導入時初期設定、ブックマーク

Firefox の初期状態のブックマークの内容は、変更することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck) を使用すると、初期状態のブックマークを変更する機能を含むアドオンを作成することができます。

### 設定ファイルで任意のブックマーク項目を初期状態に追加する

設定ファイルを使用して任意のブックマーク項目を初期状態に追加する手順は以下の通りです。

1. 後述する内容で、テキストファイル `distribution.ini` を作成します。
2. Firefox の実行ファイルと同じ位置に `distribution` という名前でフォルダーを作成します。Firefox が `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、作成するフォルダーのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution` となります。
3. 1 で作成したフォルダーの中に `distribution.ini` を設置します。最終的なファイルのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution\distribution.ini` となります。

`distribution.ini` の内容は以下の要領で記述します。なお、日本語を記述する場合は文字エンコーディングを UTF-8 にしてファイルを保存してください。

```ini
[Global]
; カスタマイズ済み Firefox を識別する一意な名前。
id=our-customized-firefox
; カスタマイズのバージョン。
version=1.0
; 「Mozilla Firefox について」に表示される説明文。
about=Customized Version
; 初期化が完了したことを保持する設定の名前。
bookmarks.initialized.pref=distribution.ini.boomkarks.initialized

; ブックマークツールバーへの追加項目
[BookmarksToolbar]
item.1.title=ブックマーク 1 のタイトル
item.1.link=ブックマーク 1 の URL
item.1.description=ブックマーク 1 の説明文 (省略可)
; 添字を変えて複数の項目を登録できる
item.2.title=ブックマーク 2 のタイトル
item.2.link=ブックマーク 2 の URL
item.2.description=ブックマーク 2 の説明文 (省略可)
; セパレータも挿入できる
item.3.type=separator
; フォルダーも挿入できる
item.4.type=folder
item.4.title=フォルダー名
; この「id」を、後の「BookmarksFolder-X」の部分に指定する
item.4.folderId=1

; ブックマークメニューへの追加項目
[BookmarksMenu]
item.1.type=folder
item.1.title=フォルダー名その 2
item.1.folderId=2

[BookmarksFolder-1]
item.1.title=ブックマークツールバーに追加したフォルダー中の項目 1 のタイトル
item.1.link=ブックマークツールバーに追加したフォルダー中の項目 1 の URL

[BookmarksFolder-2]
item.1.title=ブックマークメニューに追加したフォルダー中の項目 1 のタイトル
item.1.link=ブックマークメニューに追加したフォルダー中の項目 1 の URL
```

また、[CCK2 Wizard](#cck) でも同様のカスタマイズが可能です。

### 注意事項

`distribution.ini` を使った設定手順では項目を追加することはできますが、削除することはできません。ブックマークの初期状態を完全に空にしたり、ブックマークの任意の初期項目を削除したりするには、そのためのアドオンを開発するか、userChrome.js スクリプトなどを使う必要があります。

<!--
`%AppDir%\browser\defaults\profile\bookmarks.html` を設置すると、アドオンを使わなくてもできる。
-->

<!--
## ブックマークを初期状態で空にしたい (未稿)
  bookmarks.html
`%AppDir%\browser\defaults\profile\bookmarks.html` を設置するとできる。
-->

<!--
## ブックマークツールバーを初期状態で非表示にしたい (未稿)
  localstore.rdf
`%AppDir%\browser\defaults\profile\localstore.rdf` を設置するとできる。
-->

## プロキシの設定を固定・強制したい

キーワード: 導入時初期設定、機能制限

Firefox のネットワーク設定において、プロキシの使用を強制することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck) を使用すると、プロキシ設定を自動的に行うアドオンを作成することができます。

### 設定ファイルでプロキシの設定を指定する

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

特定の HTTP プロキシの使用を強制する場合は以下のように設定します。

```js
lockPref("network.proxy.type", 1);
lockPref("network.proxy.http", "proxy.hostname");
lockPref("network.proxy.http_port", 8080);
```

自動設定スクリプトの使用を強制する場合は以下のように設定します。

```js
lockPref("network.proxy.type", 2);
lockPref("network.proxy.autoconfig_url", "http://internal-server/proxy.pac");
```

また、[CCK2 Wizard](#cck) でも同様のカスタマイズが可能です。

## プロキシを使用しない例外サイト (ドメイン) を指定したい

キーワード: 導入時初期設定

Firefox は、プロキシを使用しない例外サイトを管理する設定 UI を持っていません。その代わり、自動プロキシ設定スクリプト (PAC ファイル) を使うことで、アクセス先の URL に応じてプロキシを使用するかどうか、どのプロキシを使用するかを細かく制御することができます。

### 設定方法

1. 自動プロキシ設定スクリプト (PAC ファイル) を作成します。記述方法は、[Microsoft の技術資料](https://technet.microsoft.com/ja-jp/library/cc985335.aspx "付録 B : 自動プロキシ構成スクリプトの例") などを参考にしてください。
2. 作成した自動プロキシ設定スクリプトをクライアントからアクセス可能な位置に設置し、その URL を控えます。例えば以下の要領です。
    * ウェブサーバー上に設置する。`http://internal-server/proxy.pac` など。
    * ネットワークドライブ上のファイルやローカルファイルとして設置する。`file:///Z:/firefox/proxy.pac` など。
    * Samba サーバー、NAS などの上に設置する。`file://///file-server/shared/firefox/proxy.pac` など。
3. 作成した自動プロキシ設定スクリプトを Firefox で使用するように設定します。
    * ユーザー固有の設定とする場合は、Firefox のオプション画面で [詳細] > [ネットワーク] > [接続設定] と辿り、[自動プロキシ設定スクリプト URL] を選択して、2 で控えた URL を指定します。
    * 設定を管理者が集中管理する場合は、`network.proxy.type` の値を `2` にした上で、`network.proxy.autoconfig_url` の値に 2 で控えた URL を指定します。例えば [MCD (AutoConfig)](#mcd) では以下の要領です。

        ```js
        lockPref("network.proxy.type", 2);
        lockPref("network.proxy.autoconfig_url", "http://internal-server/proxy.pac");
        ```

## 履歴を保存させたくない

キーワード: 導入時初期設定、機能制限

Firefox でのウェブページの閲覧履歴について、一切の履歴を保存しないように設定することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
lockPref("places.history.enabled", false);
```

### 注意事項

過去のバージョンの Firefox では日数単位で閲覧履歴の保持期限を設定することができましたが、現在のバージョンの Firefox では、閲覧履歴を保存するかしないかの 2 択となっています。よって、短い期間だけ履歴を保存するということはできません。

## 一定以上の日数が経過した履歴を自動的に消去したい

キーワード: 導入時初期設定、機能制限

現在のバージョンの Firefox は、一定以上の日数が経過した履歴を自動的に消去する機能を持っていません。アドオンを使用することで、古い履歴を自動的に消去させることができます。

### 設定方法

日数ベースでの履歴の管理機能を Firefox に導入する方法としては、アドオン [Expire history by days](https://addons.mozilla.org/firefox/addon/expire-history-by-days/) の利用が挙げられます。例えば、Expire history by days を使って履歴の有効期限を 30 日に設定する場合の手順は以下の通りです。

1. [管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従い、Expire history by days を導入します。
2. [MCD (AutoConfig)](#mcd) を使い、以下の通り設定します。

    ```js
    lockPref("extensions.bonardonet.expire-history-by-days.days", 30);
    ```

## サイトごとの機能の許可をあらかじめ設定しておきたい (位置情報の取得の可否、アドオンのインストールの可否など)

キーワード: 導入時初期設定

Firefox には、Cookie や位置情報などのウェブページから利用できる様々な機能について、機能の許可をウェブサイトごとに管理する仕組みが備わっています。すでに保存されている設定については、`about:permissions` (サイト別設定マネージャー) で設定の変更や消去が可能です。

アドオンを使うことによって、これらのサイト別設定を管理者が任意の状態に設定することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck) を使用すると、サイトごとの機能の利用許可を行うアドオンを作成することができます。

### より詳細な設定を伴う実現方法

サイト別設定を管理者が詳細に管理する方法として、アドオン [Permissions Auto Registerer](https://addons.mozilla.org/firefox/addon/permissions-auto-registerer/) の利用が挙げられます。例えば、Permissions Auto Registerer を使って `www.example.com` に対しサイト別設定の全項目を「禁止」と設定する場合の手順は以下の通りです。

1. [管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Permissions Auto Registerer を導入します。
2. [MCD (AutoConfig)](#mcd) を使い、以下の通り設定します。

    ```js
    lockPref("extensions.autopermission.sites.www.example.com", "password=2, geo=2, cookie=2, popup=2, indexedDB=2, fullscreen=2, image=2, install=2, offline-app=2");
    ```

設定名はサイト別設定を指定するサイトのドメイン名を含めて `extensions.autopermission.sites.<ドメイン名>` とします。設定値は、1 つ以上の設定項目についてキーと値を `=` で繋げたリストをカンマ区切りで列挙した文字列で指定します。指定可能な設定項目は以下の通りです。

* `password`: パスワードを保存する。
* `geo`: 位置情報を取得する。
* `cookie`: Cookie を保存する。
* `popup`: ポップアップウィンドウを開く。
* `indexedDB`: オフラインストレージを利用する。
* `fullscreen`: DOM フルスクリーン API を利用する。
* `image`: 画像を読み込む。
* `install`: アドオンのインストールを許可する。
* `offline-app`: オフラインアプリケーション用のキャッシュの利用を許可する。

また、個々の項目の値は以下のいずれかを取ります。

* `0`: 不明。どうするかはユーザーに尋ねる。
* `1`: 許可する。
* `2`: 禁止する。

また、[CCK2 Wizard](#cck) でも機能の利用を許可するドメインの指定が可能です。

## ロケーションバーで常に「http://」を表示させたい

キーワード: 導入時初期設定

Firefox のロケーションバーでは通常、URL 文字列の先頭の `http://` は省略して表示されますが、これを常に表示するように設定することができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
lockPref("browser.urlbar.trimURLs", false);
```

## 独自 SSL 証明書やルート証明書をあらかじめ登録済みの状態にしたい

キーワード: 導入時初期設定

Firefox にあらかじめ登録されているもの以外の証明局によって署名された証明書 (いわゆる自己署名証明書など) を使ったウェブサイトに SSL で接続すると、Firefox は不明な証明書として警告を表示します。それらの証明書を別途安全な手段で提供できるのであれば、証明書を Firefox にあらかじめ登録しておくことで、警告画面を見ずにウェブサイトを利用することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck) を使用すると、任意の証明書を自動登録するアドオンを作成することができます。

### より詳細な設定を伴う実現方法

証明書を管理者があらかじめ登録しておく別の方法としては、アドオン [Cert Importer][] の利用が挙げられます。例えば、Cert Importer を使ってルート証明書 `myCA.crt` を登録する場合の手順は以下の通りです。

1. [管理者によるアドオンのインストール手順](#install-addons-by-administrator) に従って Permissions Auto Registerer を導入します。
2. Firefox の実行ファイルと同じ位置にある `defaults` フォルダーに `myCA.crt` を置きます。Firefox が `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、最終的なファイルのパスは `C:\Program Files (x86)\Mozilla Firefox\defaults\myCA.crt` となります。

以上で設定は完了です。Firefox の次回起動時にアドオンがファイルを自動認識し、証明書に設定されたフラグに従って証明書の登録を行います。Firefox のオプション画面で [詳細] > [証明書] > [証明書を表示] と辿り、証明書が正しく登録されているかどうかを確認してください。

また、[CCK2 Wizard](#cck) でも機能の利用を許可するドメインの指定が可能です。

#### 証明書の種類を正しく認識しない場合

Cert Importer が証明書自身に設定されたフラグを正しく認識できなかった場合、ルート証明書が SSL のサイト証明書として登録されるといった結果になることがあります。このような場合は、設定を用いて強制的に証明書の種類を上書き指定することができます。以下は、[MCD (AutoConfig)](#mcd) での設定例です。

```js
defaultPref("extensions.certimporter.certs.myCA.crt", 1);
```

証明書の種類を指定する設定の名前は `extensions.certimporter.certs.<ファイル名>` とし、値は以下の整数値の 1 つ以上の和を指定します。

* `1`: ルート証明書。
* `2`: ユーザー証明書。
* `4`: E-mail 証明書。
* `8`: SSL サイト証明書。

#### SSL のセキュリティ例外の自動登録

Cert Importer は、SSL のセキュリティ例外について、特定のホストを対象に設定することもできます。詳細は [Cert Importer][] の説明文を参照してください。

# その他便利な機能

## IMAP フォルダーのローカルコピーを一切残させたくない

キーワード: 機能制限、情報漏洩対策

Thunderbird は IMAP サーバーを使用するメールアカウントについて、メールの本文をダウンロードせずヘッダー情報だけをダウンロードする設定が可能です。しかしながら、ヘッダー情報はローカルに保存される上、一度表示したメールについては本文のデータもディスクキャッシュ上に保存されるため、情報漏洩対策として IMAP を使用するという場合には、その設定だけでは目的を十分には達成できません。

アドオン [IMAP キャッシュの自動消去 (Clear IMAP Cache)][] を導入すると、Thunderbird を終了する度にダウンロード済みのヘッダー情報とディスクキャッシュを自動的に消去させることができます。これによって、情報漏洩対策としての実効性をより高めることができます。

### 注意事項

このアドオンを使うことで完全な情報漏洩対策が実現される、というわけではないことに注意してください。例えば、ヘッダー情報が保存されているファイルが使用中の場合には、このアドオンではヘッダー情報が消去されない場合があります。

## Outlook との連携時に `winmail.dat` を簡単に開けるようにしたい

キーワード: アプリケーション連携

Outlook から送信したメールには、`winmail.dat` というファイルが添付されている場合があります。このファイルにはリッチテキスト形式の本文が保存されていますが、Thunderbird では内容を閲覧することができません。そのため、添付された `winmail.dat` をダブルクリック等で開こうとした場合には、ファイルが開かれるのではなくファイルのダウンロード (ファイルとして保存する処理) が開始されます。

`winmail.dat` の内容は、[WinmailOpener][] という別のソフトウェアで閲覧することができます。アドオン [Winmail Opener Bridge][] を導入すると、添付された `winmail.dat` を開こうとした時に自動的に WinmailOpener でファイルが開かれるようになります。

### 注意事項

Winmail Opener Bridge には WinmailOpener は同梱されていません。利用にあたっては、別途 WinmailOpener をインストールしておく必要があります。

## メールアカウント作成ウィザードで特定組織向けのメールアカウントをもっと簡単に作成させたい

キーワード: 導入時初期設定

Thunderbird のメールアカウント作成ウィザードでは、Mozilla 公式に提供されている ISP の情報や、メールサーバーに設置された設定情報、一般的なメールサーバーの設定の流儀などに従って、メールアドレスとパスワードを入力するだけでメールアカウントを半自動的に作成することができます。しかしながら、メールサーバーなどの基本的な設定以外の項目 (例えば HTML メールの利用の可否など) は、その後改めて手動で設定する必要があります。

アドオン [AutoConfiguration Hook][] を使用すると、あらかじめメールアカウント情報のテンプレートとなる設定ファイルを用意しておくことにより、基本設定以外の項目についてもメールアカウント作成時の初期値を指定することができます。また、メールアドレスのローカルパートのみを入力させてメールアカウントを作成できる、特定組織向けのメールアカウント作成専用のウィザードも利用可能になります。

## メールアドレス入力欄の 2 番目以降に不正なアドレスが入力されているときに警告のメッセージを出したい

キーワード: 障害回避

Thunderbird は、メールの宛先が正しいメールアドレスでない場合、メール送信時に警告が表示される仕様になっています。しかしながら、2 つ目以降の宛先についてはこの確認が行われないという不具合 (制限事項) があります。

アドオン [不正なアドレスの警告表示パッチ (Patch to Alert Invalid Addresses)][] を使用すると、2 つ目以降の宛先についても最初の宛先と同様の妥当性検証が行われるようになります。

## ローカルファイルに対するリンクをメール本文中に挿入したい

キーワード: 利便性向上

古いバージョンの Thunderbird では、メール編集ウィンドウの本文領域にファイルをドラッグ＆ドロップすると、ファイルの URL 文字列がその位置に挿入される仕様でした。しかしながら、現在のバージョンの Thunderbird では、この機能は廃止されています。

アドオン [ローカルファイルからのリンク挿入 (Insert Link from Local File)][] を導入すると、古いバージョンの Thunderbird と同様に、ファイルのドロップ位置にそのファイルの URL を挿入できるようになります。挿入された URL は、受信者側ではリンクとして利用することができます。

これによって、社内でのメールのやりとりにおいて、ファイルを添付する代わりに共有フォルダーに置き URL だけをやりとりする、といった使い方が容易になります。

## Windows のショートカットを添付できるようにしたい、添付された Windows のショートカットを直接実行したい

キーワード: 利便性向上

Thunderbird では、Windows のショートカットファイルをメールに添付することができません。また、添付されたショートカットファイルを受信した場合にも、それを直接開くことはできず、一旦ファイルとして保存してから改めて開く必要があります。

アドオン [Windows ショートカットの直接実行 (Open Windows Shortcuts Directly)][] を導入すると、ショートカットをメール編集ウィンドウの宛先領域周辺にドラッグ＆ドロップすることによってファイルとしてそのまま添付できるようになります (※メニューからの操作でコモンダイアログから選択した場合は、ショートカットのリンク先の実体ファイルが添付されます)。また、ショートカットが添付されたメールについては、ショートカットをダブルクリックするなどの操作によりリンク先の実体ファイルを直接開けるようになります。

これによって、社内でのメールのやりとりにおいて、ファイルを添付する代わりに共有フォルダーに置きショートカットだけをやりとりする、といった使い方が容易になります。

## 添付ファイルの文字エンコーディングの自動判別をより賢くしたい

キーワード: 利便性向上

Thunderbird では、プレーンテキスト形式のファイルを添付する際にファイルの文字エンコーディングを自動判別し、ヘッダー情報に含めるようになっています。しかしながら、この自動判別があまり正確でないため、Shift_JIS や EUC-JP のテキストファイルを添付した場合に受信者側で文字化けして表示されることがあります。

アドオン [添付ファイルの文字エンコーディングの自動判別 (Attachemnt Encoding Detector)][] を導入することにより、上記処理における文字エンコーディングの自動判別において言語別の自動判別器が使われるようになり、文字化けの発生を低減することができます。

## アドレス帳を複数コンピューター間で同期したい

キーワード: 利便性向上

Thunderbird では、LDAP アドレス帳機能によって、ディレクトリーサーバー内に格納されている情報をアドレス帳として参照することができます。しかしながら、この機能にはいくつかの制限事項があります。

* LDAP アドレス帳への書き込みはできません。読み込みのみの利用となります。
* ディレクトリーサーバーに接続する際のユーザーを Windows のログオンユーザーと連携させること (シングルサインオン) はできません。

LDAP アドレス帳ではないアドレス帳の共有または同期を可能にする方法として、アドオン [Addressbooks Synchronizer][] の使用が挙げられます。このアドオンを使用すると、例えば以下のような運用も可能となります。

* アドレス帳を IMAP サーバー上にメールの添付ファイルとして保存し、複数 PC 間でアドレス帳を同期する。
* アドレス帳を HTTP または FTP サーバー上に設置しておき、複数ユーザー・複数 PC から読み込み専用の共有アドレス帳として参照する。

## 初期状態で表示するカラムを変更しておきたい

キーワード: 導入時初期設定

Thunderbird のスレッドペインでは、初期状態でどのカラムを表示しておくかが決め打ちになっており、例えば「重要度」のようなカラムをすべてのフォルダー・すべてのアカウントで最初から表示された状態にしておきたいと思っても、管理者がそれを全クライアントに反映することはできません。

アドオン [Set Default Columns][] を使用すると、初期状態で表示しておくカラムを [MCD (AutoConfig)](#mcd) の設定ファイルなどからカスタマイズすることができます。

### 設定方法

以下は、[MCD (AutoConfig)](#mcd) で、「重要度」のカラムを初期状態で表示するようにする設定例です。

```js
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
```

すでに 1 度でも内容を表示したことがあるフォルダーについては、最後に内容を表示した時の表示カラムの状態が記憶されています。ここで設定した既定の表示カラムを反映するためには、カラム行の右端のアイコンをクリックしてメニューから [初期状態に戻す] を選択する必要があります。

# カスタマイズ済みの Firefox・Thunderbird の展開

## アドオンを 1 つインストールするだけでカスタマイズが完了する、という形で複雑なカスタマイズ内容を展開したい

キーワード: 導入時初期設定

アドオン [CCK2 Wizard](#cck) を使うと、当該アドオンのインストール 1 度だけで以下のようなカスタマイズを済ませることのできる「カスタマイズ用アドオン」を作成することができます。

* ホームページの変更
* Firefox Sync の無効化
* アドオンマネージャーからのアドオンのインストールの禁止
* その他、[MCD (AutoConfig)](#mcd) 相当の設定変更
* Firefox を既定のブラウザーに自動設定する
* ヘルプメニューの変更
* ドメインごとの機能の利用許可の初期設定
* 検索エンジンの変更・追加
* 初期状態のブックマークの内容の変更
* Windows レジストリの変更
* 証明書の自動インポート
* `about:config` の利用禁止
* プライベートブラウジング機能の利用禁止
* アドオンの同梱
* プラグインの同梱

## Firefox・Thunderbird に MCD (AutoConfig) の設定ファイルをバンドルして展開したい

キーワード: 導入時初期設定

実行ファイルを 1 つ実行するだけで Firefox のインストールと設定ファイルの設置をすべて完了するソフトウェアの例としては、[Fx Meta Installer][] があります。Fx Meta Installer の使用方法については、開発元による [Fx Meta Installer のチュートリアル][] などを参照してください。

Firefox のインストール後に別途アドオンをインストールすることによってカスタマイズを完了する形態であれば、[CCK2 Wizard](#cck) によってそのようなアドオンを作成することができます。

## Firefox・Thunderbird にアドオンをバンドルして展開したい

キーワード: 導入時初期設定

実行ファイルを 1 つ実行するだけで Firefox のインストールとアドオンのインストールをすべて完了するソフトウェアの例としては、[Fx Meta Installer][] があります。Fx Meta Installer の使用方法については、開発元による [Fx Meta Installer のチュートリアル][] などを参照してください。

Firefox のインストール後に別途アドオンをインストールすることによってカスタマイズを完了する形態であれば、[CCK2 Wizard](#cck) によってそのようなアドオンを作成することができます。

## Firefox に Java や Flash などのプラグインをバンドルして展開したい

キーワード: 導入時初期設定

実行ファイルを 1 つ実行するだけで Firefox のインストールとプラグインのインストールをすべて完了するソフトウェアの例としては、[Fx Meta Installer][] があります。Fx Meta Installer の使用方法については、開発元による [Fx Meta Installer のチュートリアル][] などを参照してください。

Firefox のインストール後に別途アドオンをインストールすることによってカスタマイズを完了する形態であれば、[CCK2 Wizard](#cck) によってそのようなアドオンを作成することができます。

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
[Flex Confirm Mail]: https://addons.mozilla.org/thunderbird/addon/flex-confirm-mail/
[Force Addon Status]: https://addons.mozilla.org/firefox/addon/force-addon-status/
[Fx Meta Installer]: https://github.com/clear-code/fx-meta-installer
[Fx Meta Installer のチュートリアル]: http://www.clear-code.com/blog/2012/11/7.html
[globalChrome.css]: https://addons.mozilla.org/firefox/addon/globalchromecss/
[GPO For Firefox]: https://addons.mozilla.org/firefox/addon/gpo-for-firefox/
[Hide Option Pane]: https://addons.mozilla.org/firefox/addon/hide-option-pane/
[History Prefs Modifier]: https://addons.mozilla.org/firefox/addon/history-prefs-modifier/
[IMAP キャッシュの自動消去 (Clear IMAP Cache)]: https://addons.mozilla.org/thunderbird/addon/clear-imap-local-cache/
[Only Minor Update]: https://addons.mozilla.org/firefox/addon/only-minor-update/
[Permissions Auto Registerer]: https://addons.mozilla.org/firefox/addon/permissions-auto-registerer/
[Set Default Columns]: https://addons.mozilla.org/thunderbird/addon/set-default-columns/
[UI Text Overrider]: https://addons.mozilla.org/firefox/addon/ui-text-overrider/
[Windowsショートカットの直接実行 (Open Windows Shortcuts Directly)]: https://github.com/clear-code/openshortcuts/releases
[WinmailOpener]: https://www.google.co.jp/search?q=WinmailOpener
[Winmail Opener Bridge]: https://addons.mozilla.org/thunderbird/addon/winmail-opener-bridge/
[不正なアドレスの警告表示パッチ (Patch to Alert Invalid Addresses)]: https://addons.mozilla.org/thunderbird/addon/patch-to-alert-invalid-addr/
[ローカルファイルからのリンク挿入 (Insert Link from Local File)]: https://addons.mozilla.org/thunderbird/addon/insert-link-from-local-file/
[添付ファイルの文字エンコーディングの自動判別 (Attachemnt Encoding Detector)]: https://addons.mozilla.org/thunderbird/addon/attachemnt-encoding-detecto/
[@-moz-document について参考]: http://www.akatsukinishisu.net/wiki.cgi?%40-moz-document
