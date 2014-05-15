# 設定の管理

## 設定を管理者が管理したい {#control-configurations-by-administrator}

キーワード：機能制限、導入時初期設定、集中管理

FirefoxやThunderbirdには、設定を管理者が管理し、ユーザが自由に変更できないようにするための機能が備わっています。
この機能は「Mission Control Desktop（MCD）」や「AutoConfig」などと呼ばれています。

また、アドオンを使うとActive Directoryのグループポリシーで設定を集中管理することもできます。

### ウィザードでの実現 {#cck}

アドオン [CCK2 Wizard][]を使用すると、MCD相当の設定を行ったり、それ以上のことをしたりするアドオンまたは設定ファイル群を作成することができます。

CCK2 Wizardの大まかな利用手順は以下の通りです。

 1. 管理者のPC上のFirefoxに、CCK2 Wizardを通常通りインストールします。
 2. ツールバー上に追加される「CCK2 Wizard」ボタンをクリックし、ウィザードを起動します。
 3. 「File」→「New」と辿り、カスタマイズ用設定の名前と一意な識別子を入力します。
 4. ウィザード（設定の入力画面）が出るので、行いたいカスタマイズの内容を決定します。
 5. ウィザードの最後のページで「Create an Extension」または「Use AutoConfig」ボタンを押下し、カスタマイズ用のファイルを出力します。
 6. 5で「Create an Extension」を選択した場合、アドオンのインストールパッケージが出力されるので、各クライアントにアドオンをインストールします。
    「AutoConfig」を選択した場合、カスタマイズ用ファイルを圧縮したZIPファイルが出力されるので、各クライアントのFirefoxのインストール先にZIPファイルの内容を展開して設定ファイル群をインストールします。


### MCD用設定ファイルでの実現 {#mcd}

以下では、Firefoxの自動アップデートを禁止するという場合を例にとって設定の手順を説明します。

#### 設定方法

以下の内容のプレーンテキストファイル `autoconfig.js` を用意します。

    pref("general.config.filename", "autoconfig.cfg");
    pref("general.config.vendor", "autoconfig");
    pref("general.config.obscure_value", 0);

作成した `autoconfig.js` を、Firefoxのインストール先の `defaults/prefs/` ディレクトリに置きます（Windowsであれば、 `C:\Program Files (x86)\Mozilla Firefox\defaults\prefs\autoconfig.js` など）。

以下の内容のプレーンテキストファイル `autoconfig.cfg` を用意します。

    // 1行目は必ずコメントとしてください。
    lockPref("app.update.enabled", false);

作成した `autoconfig.cfg` を、FirefoxまたはThunderbirdのインストール先ディレクトリに置きます（Windowsであれば、 `C:\Program Files (x86)\Mozilla Firefox\autoconfig.cfg` など）。

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

なお、設定画面の「プライバシー」パネルに対応する設定を `pref()` や `defaultPref()` で変更した場合、設定ダイアログを開いた時の状態が期待通りに初期化されない場合があります。この問題の簡単な回避策としては、アドオン [History Prefs Modifier][]が利用できます。

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


### グループポリシーでの実現 {#group-policy}

アドオン[GPO For Firefox][]を使用すると、グループポリシー経由でMCDと同様の設定の集中管理を行えます。

#### 設定の手順


 * 各クライアントについては、[管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってGPO For Firefoxをインストールします。
 * ドメインコントローラについては、[アドオンのダウンロードページ][GPO For Firefox]の「You can find an adm file ready to be used for your GPO at the following link.」と書かれた箇所にあるリンクから管理用テンプレートファイル（admファイル）をダウンロードして読み込ませます。
   その後、読み込まれたテンプレートを使って設定を行います。
   例えば、Windows Server 2008R2での手順は以下の通りです。
   1. Active Directoryドメインを構築します。
   2. ドメインの管理者でログインします。
   3. [ローカル グループ ポリシー エディターを開く](http://technet.microsoft.com/ja-jp/library/cc731745.aspx "ローカル グループ ポリシー エディターを開く")の手順に則って、ローカル グループ ポリシー エディターを起動します。
     （ファイル名を「gpedit.msc」と指定して起動します。）
   4. [従来の管理用テンプレートを追加または削除する](http://technet.microsoft.com/ja-jp/library/cc772560.aspx "従来の管理用テンプレートを追加または削除する")の手順に則って、テンプレートを読み込ませます。
      （「コンピューターの構成」配下の「管理用テンプレート」を右クリックして「テンプレートの追加と削除」を選択し、firefox.admを指定して追加します。）
   5. 「従来の管理用テンプレート（ADM）」配下に「Mozilla Firefox」が追加されるので、必要な設定を変更します。

以降は、ドメインに参加したWindows PC上でFirefoxを起動する度に、グループポリシーで変更された設定が読み込まれ、反映されるようになります。

#### 注意点

 * 上記ページからダウンロードできる管理用テンプレートファイルの内容は、すべて英語となっています。
   日本語で設定を管理したい場合は、管理用テンプレートファイルを自分で翻訳する必要があります。
 * 管理できる設定項目は、管理用テンプレートファイルに記述されている物のみとなります。
   それ以外の設定を管理したい場合は、管理用テンプレートファイルを自分で編集する必要があります。

#### 管理用テンプレートファイルに無い設定項目の管理について

FirefoxやThunderbird自体の更新によって追加・変更・廃止された設定をグループポリシーとして管理できるようにするためには、管理用テンプレートファイルを自分で修正・更新する必要があります。

管理用テンプレートファイルを編集する際は、MCDでの設定で使用する設定名とその値が、ドメインのメンバとなるWindows PCの以下のレジストリキー以下に書き出されるようにして下さい。

 * ユーザ自身による変更を許容しない、管理者が固定する設定（Locked Settings）
   * 全ユーザに反映する場合：`HKEY_LOCAL_MACHINE\Software\Policies\Mozilla\lockPref`
   * ユーザごとに反映する場合：`HKEY_CURRENT_USER\Software\Policies\Mozilla\lockPref`
 * ユーザ自身による変更を許容する、初期値の設定（Default Settings）
   * 全ユーザに反映する場合：`HKEY_LOCAL_MACHINE\Software\Policies\Mozilla\defaultPref`
   * ユーザごとに反映する場合：`HKEY_CURRENT_USER\Software\Policies\Mozilla\defaultPref`

真偽型の設定は、`true`を整数の`1`、`false`を整数の`0`として書き出して下さい。

例えば「Firefoxの自動アップデートを禁止する設定を、全ユーザに対して、強制的に反映させる」という場合の設定内容は以下の要領です。

 * 書き込む先のレジストリキー：`HKEY_LOCAL_MACHINE\Software\Policies\Mozilla\lockPref`
 * 書き込む値の名前：`app.update.enabled`
 * 書き込む値のデータ：`0`



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

作成した `autoconfig.js` を、Firefoxのインストール先の `defaults/prefs/` ディレクトリに置きます（Windowsであれば、`C:\Program Files (x86)\Mozilla Firefox\defaults\prefs\autoconfig.js` など）。

以下の内容のプレーンテキストファイル `autoconfig.cfg` を用意します。

    // 1行目は必ずコメントとしてください。
    lockPref("autoadmin.global_config_url", "http://internalserver/autoconfig.jsc");

作成した `autoconfig.cfg` を、FirefoxまたはThunderbirdのインストール先ディレクトリに置きます（Windowsであれば、`C:\Program Files (x86)\Mozilla Firefox\autoconfig.cfg` など）。

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




## 一部の設定項目を非表示にして、ユーザが設定を変更できないようにしたい

キーワード：機能制限、導入時初期設定、集中管理

[MCD（AutoConfig）](#mcd)や[グループポリシーによる設定](#group-policy)では、管理者がFirefoxやThunderbirdの設定を固定し、ユーザ自身による自由な変更を禁止することができます。また、アドオンを併用することによって、変更できなくした設定を画面上に表示しないようにすることができます。

### ウィザードでの実現

[CCK2 Wizard](#cck)を使用すると、設定値を変更不可能な状態に固定する機能を含むアドオンを作成することができます。

### MCDでの実現

[MCD（AutoConfig）](#mcd)機能が提供する `lockPref()` ディレクティブを使用すると、ユーザによる設定の変更を禁止できます。詳細は[設定を管理者が管理したい](#control-configurations-by-administrator)を参照して下さい。

`lockPref()` によって値が固定された設定は、Firefox・Thunderbirdの設定画面上ではグレイアウトして表示されます。

変更できない状態になっている設定項目をそもそもUI上に表示しないようにするためには、アドオン [globalChrome.css][]を使うなどしてUI要素を隠す必要があります。globalChrome.css を使う場合の手順は以下の通りです。

 1. [DOM Inspector][] をインストールします。
 2. `ツール`→`Web開発`→`DOM Inspector` でDOM Inspectorを起動し、その状態で設定画面を開きます。
 3. 設定ダイアログを操作し、非表示にしたい設定項目が表示された状態にします。
 4. `File`→`Inspect Chrome Document`を選択し、設定画面のタイトルと同じ項目を選択します。
 5. 非表示にしたい項目のIDを調べる。
 6. 「メモ帳」などのテキストエディタを開き、4で調べたIDを使って項目を非表示にするスタイル指定を記述します。
    
    以下は Firefoxの設定の「一般」パネルにおける起動時の挙動の設定を非表示にする場合の例。
    
        @-moz-document url-prefix(chrome://browser/content/preferences/preferences.xul) {
          #startupGroup {
            /* display:none はDOMツリーに変化を与えて挙動を壊す恐れがあるため、
               単に非表示にするのみとする。 */
            visibility: collapse !important;
            -moz-user-focus: ignore !important;
          }
        }
    
    （ `@-moz-document` は、特定のウィンドウに対してのみスタイル指定を反映させるための記述です。詳細は[@-moz-document について参考][]を参照して下さい。）
 7. 6で作成した内容を `globalChrome.css` という名前のプレーンテキストファイルに保存します。
 8. 7で作成したファイルをFirefox（Thunderbird）のインストール先の `chrome` フォルダに設置します。
    （Windows Vista以降の場合のファイルの設置場所は `C:\Program Files (x86)\Mozilla Firefox\chrome\globalChrome.css` となる。）
 9. [管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従って[globalChrome.css][]を導入します。

なお、設定画面上部の`全般` `タブ`などのパネル切り替えボタン自体や、`詳細`における`更新`などのタブを非表示にする場合には注意が必要です。
これらの切り替えボタンやタブを単純に非表示にすると、ボタンやタブとパネルの内容の対応関係が崩れる場合があります。これらの問題の簡単な解決策としては、アドオン [Hide Option Pane][]の利用が挙げられます。

### グループポリシーでの実現

[グループポリシーによる設定](#group-policy)では、ユーザ自身による変更を許容しない設定（Locked Settings）も可能です。

ただし、グループポリシーとの連携だけでは設定項目は非表示にできません、設定項目を非表示にするためには、MCDの場合と同様に、アドオン [globalChrome.css][]を使うなどしてUI要素を隠す必要があります。





## Thunderbirdのアカウント設定を非表示にしたい（管理者が設定を集中管理するので、アカウント設定の画面にアクセスさせたくない）

キーワード：機能制限、導入時初期設定、集中管理

[MCD（AutoConfig）](#mcd)や[グループポリシー](#group-policy)などの方法でアカウント設定を管理者が管理する際に、ユーザがアカウント設定の画面にアクセスできないようにすることができます。

### 設定方法

アカウント設定画面へのアクセス経路をUI上に表示しないようにするためには、アドオン [globalChrome.css][]を使うなどしてメニュー項目を隠す必要があります。globalChrome.css を使う場合の手順は以下の通りです。

 1. 「メモ帳」などのテキストエディタを開き、4で調べたIDを使って項目を非表示にするスタイル指定を記述します。
    

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
 3. 2で作成したファイルをFirefox（Thunderbird）のインストール先の `chrome` フォルダに設置します。
    （Windows Vista以降の場合のファイルの設置場所は `C:\Program Files (x86)\Mozilla Firefox\chrome\globalChrome.css` となる。）
 4. [管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従って[globalChrome.css][]を導入します。






## about:config（設定エディタ）の利用を禁止したい

キーワード：機能制限、導入時初期設定、集中管理

無用なトラブルを避けるため、ユーザが `about:config`（設定エディタ）の画面にアクセスできないようにすることができます。

### 設定方法

`about:config` の利用を禁止する最も簡単な方法は、アドオン [Disable about:config][]を使うことです。
[管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってDisable about:configを導入すると、`about:config` へのアクセスが完全に禁止されます。

また、[CCK2 Wizard](#cck)でも同様のカスタマイズが可能です。






# アドオン、プラグイン

## アドオンの利用を禁止したい（ユーザが任意にアドオンをインストールできないようにしたい）

キーワード：機能制限、導入時初期設定、集中管理、アドオン

無用なトラブルを避けるため、ユーザが任意にアドオンをインストールできないよう設定することができます。

### 設定方法

アドオンの利用を禁止する最も簡単な方法は、アドオン [Disable Addons][]を使うことです。
[管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってDisable Addonsを導入すると、以下の操作が完全に禁止されます。

 * ユーザがWebページからアドオンをダウンロードしてきてインストールする。
 * ユーザがアドオンのインストーラパッケージをFirefoxのウィンドウにドラッグ＆ドロップしてインストールする。
 * ユーザがアドオンのインストーラパッケージをFirefoxのショートカットにドラッグ＆ドロップしてインストールする。
 * ユーザがアドオンマネージャを閲覧・操作する。

### 注意事項

アドオン「Disable Addons」は、既にインストール済みの他のアドオンの状態を変更しません。
既にインストール済みのアドオンをシステム管理者の判断で強制的に無効化する方法は、[特定のアドオンやプラグイン（Javaなど）を常に無効化したい](#disable-addons-by-administrator)を参照して下さい。

また、このアドオンはアドオンマネージャへのアクセスを禁止する機能を含むため、必然的に、アドオンマネージャを必要とする以下の操作が行えなくなります。

 * アドオンの有効・無効の状態を変更する。
 * アドオンをアンインストールする。
 * アドオンの設定を変更する。（Tab Mix Plusなどのように、`ツール`メニュー等からアドオンの設定を変更できるようになっている場合を除く）

このアドオン自体をアンインストールするには、システム管理者がクライアント上からアドオンの実体となるファイルを削除する必要があります。





## 特定のアドオンやプラグイン（Javaなど）を常に無効化したい {#disable-addons-by-administrator}

キーワード：機能制限、導入時初期設定、集中管理、アドオン、プラグイン

システムに導入されているJavaやFlashなどのプラグイン、他のソフトウェアが自動的に追加するアドオンなどを、システム管理者の判断で強制的に無効化することができます。

### 設定方法

アドオンやプラグインの有効・無効の状態をシステム管理者が制御する最も簡単な方法は、アドオン [Force Addon Status][]を使うことです。
[管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってForce Addon Statusを導入した上で、[MCD（AutoConfig）](#mcd)を使って以下のような設定を施すことで、指定したアドオンやプラグインの状態を強制的に設定することができます。

    // Test Pilotアドオンを強制的に無効化する例
    pref("extensions.force-addon-status@clear-code.com.addons.tbtestpilot@labs.mozilla.com",
         true); // 設定する有効・無効の状態（true=有効、false=無効）
    
    // Javaプラグインを強制的に無効化する例
    pref("extensions.force-addon-status@clear-code.com.plugins.java.pattern",
         "^Java\(TM\) Plug-in"); // 判別のためのルール（正規表現）
    pref("extensions.force-addon-status@clear-code.com.plugins.java.status",
         false); // 設定する有効・無効の状態（true=有効、false=無効）

アドオンの状態を制御する場合は、 `extensions.force-addon-status@clear-code.com.addons.(アドオンの内部的なID)` という名前の真偽値の設定を1つ作成します。
値が `true` であればアドオンは有効化され、 `false` であれば無効化されます。

プラグインの状態を制御する場合は、 `extensions.force-addon-status@clear-code.com.plugins.(ドットを含まない任意の識別名).pattern` と `extensions.force-addon-status@clear-code.com.plugins.(ドットを含まない任意の識別名).status` という2つの設定を使用します。
まずプラグインを識別するための正規表現のルールを `extensions.force-addon-status@clear-code.com.plugins.(ドットを含まない任意の識別名).pattern` という名前の文字列型の設定として作成します。正規表現は、about:pluginsで表示されるプラグインの名前にマッチするようにします。
次に、プラグインの状態を制御する `extensions.force-addon-status@clear-code.com.plugins.(ドットを含まない任意の識別名).pattern` という名前の真偽型の設定を作成します。値が `true` であればプラグインは有効化され、 `false` であれば無効化されます。





## 管理者によるアドオンのインストール手順 {#install-addons-by-administrator}

キーワード：導入時初期設定、アドオン

FirefoxやThunderbirdは通常、ユーザが任意のアドオンをインストールして使用します。
以下の手順に則ると、管理者が、そのクライアント上のすべてのユーザを対象としてアドオンをインストールすることができます。

管理者の手動操作によるアドオンのインストール方法にはいくつかのパターンがあり、それぞれメリットとデメリットがあります。
[DOM Inspector][]をインストールする場合を例にとって、代表的な3つのパターンを解説します。

#### パターン1：組み込みモジュールとしてインストールする

この場合のインストール手順は以下の通りです。

 1. Firefoxの実行ファイルと同じ位置に `distribution` という名前でフォルダを作成します。
    Firefoxが `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、作成するフォルダのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution` となります。
 2. 1.で作成したフォルダの中に `bundles` という名前でフォルダを作成します。
 3. 2.で作成したフォルダの中に、インストールしたいアドオンの内部的なIDと同じ名前でフォルダを作成します。
    DOM Inspectorであれば、フォルダ名は `inspector@mozilla.org` となります。
 4. アドオンのインストールパッケージ（xpiファイル）をZIP形式の圧縮ファイルとして展開し、取り出されたすべてのファイルやフォルダを3.で作成したフォルダの中に置きます。
    DOM Inspectorであれば、以下のようなファイル配置になります。
    * `C:\Program Files (x86)\Mozilla Firefox\distribution\bundles\inspector@mozilla.org\install.rdf`
    * `C:\Program Files (x86)\Mozilla Firefox\distribution\bundles\inspector@mozilla.org\chrome.manifest`
    * ...

ただし、そのアドオンが検索プラグイン（検索プロバイダ）を含んでいる場合、検索プラグインのファイルは `distribution\bundles` 以下ではなく、`distribution\searchplugins\common` 以下に設置する必要があります。

この手順でインストールしたアドオンは以下の特徴を持ちます。

 * *当該アドオンはアドオンマネージャの管理下から外れます。*
   （Firefox組み込みのモジュールの1つとして認識されるようになります。）
   * *当該アドオンはアドオンマネージャ上に表示されません。*
     ユーザは当該アドオンをアドオンマネージャから認識できません。
   * ユーザは当該アドオンを削除できません。
   * *ユーザは当該アドオンを無効化できません。*
 * *当該アドオンは自動アップデートされません。*
   ただし、アップデート後のバージョンを通常のアドオンとしてユーザがインストールすることはでき、その場合、その後は通常通り自動アップデートされるようになります。
 * *Add-on SDKベースのアドオン、再起動不要なアドオンは、この方法では動作しません。*
   （ただし、例外的にこの方法でインストールしても動作する再起動不要なアドオンはいくつか存在します。）
 * *アドオンは次回起動時から強制的に有効化されます。*
 
#### パターン2：全ユーザ向けのアドオンとしてインストールする

この場合のインストール手順は以下の通りです。

 1. Firefoxの実行ファイルと同じ位置に `extensions` という名前でフォルダを作成します。
    Firefoxが `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、作成するフォルダのパスは `C:\Program Files (x86)\Mozilla Firefox\extensions` となります。
 2. 1.で作成したフォルダの中に、インストールしたいアドオンの内部的なIDと同じ名前でフォルダを作成します。
    DOM Inspectorであれば、フォルダ名は `inspector@mozilla.org` となります。
 3. アドオンのインストールパッケージ（xpiファイル）をZIP形式の圧縮ファイルとして展開し、取り出されたすべてのファイルやフォルダを2.で作成したフォルダの中に置きます。
    DOM Inspectorであれば、以下のようなファイル配置になります。
    * `C:\Program Files (x86)\Mozilla Firefox\extensions\inspector@mozilla.org\install.rdf`
    * `C:\Program Files (x86)\Mozilla Firefox\extensions\inspector@mozilla.org\chrome.manifest`
    * ...
 4. [MCD（AutoConfig）](#mcd)などを使い、以下の設定を反映します。
    
        pref("extensions.autoDisableScopes", 0);
    
    この設定を行わないと、アドオンは次回起動時には無効化された状態となります。

この手順でインストールしたアドオンは以下の特徴を持ちます。

 * *当該アドオンはアドオンマネージャの管理下に置かれます。*
   * *当該アドオンはアドオンマネージャ上に表示されます。*
     ユーザは当該アドオンをアドオンマネージャから認識できます。
   * ユーザは当該アドオンを削除できません。
     後述の通り、ユーザはアップデート後のアドオンを削除することはできますが、その場合は、管理者がインストールした最初のバージョンに戻るという結果になります。
   * *ユーザは当該アドオンを無効化できます。*
 * *当該アドオンは自動アップデートされます。*
   アップデート後のバージョンは、通常のアドオンとしてユーザがインストールした場合と同じ状態となります。
 * *Add-on SDKベースのアドオン、再起動不要なアドオンも、この方法でインストールできます。*
 * 「extensions.autoDisableScopes」の設定を変更していないと、*当該アドオンは次回起動時に強制的に無効化されます。*

#### パターン3：新規プロファイル作成時に同時にインストールされるアドオンとして登録する

この場合のインストール手順は以下の通りです。

 1. Firefoxの実行ファイルと同じ位置に `distribution` という名前でフォルダを作成します。
    Firefoxが `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、作成するフォルダのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution` となります。
 2. 1.で作成したフォルダの中に `extensions` という名前でフォルダを作成します。
 3. 2.で作成したフォルダの中に、インストールしたいアドオンのインストールパッケージ（xpiファイル）を設置します。ファイル名はアドオンの内部的なIDに合わせて変更します。
    DOM Inspectorであれば、ファイル名は `inspector@mozilla.org.xpi` で、最終的なファイルのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution\extensions\inspector@mozilla.org.xpi` となります。
 4. ユーザ権限でFirefoxを起動します。それが初回起動であれば、アドオンが自動的にインストールされます。

この手順でインストールしたアドオンは以下の特徴を持ちます。

 * *既に存在しているユーザプロファイルでFirefoxを起動した場合、当該アドオンはインストールされません*。
   当該アドオンが自動的にインストールされるのは、あくまで、新規の導入時などで新しいプロファイルが作成された場合のみに限られます。
 * 当該アドオンは、ユーザが自分でインストールしたのと同じ扱いになります。
   * 当該アドオンはアドオンマネージャ上に表示されます。
   * *ユーザは当該アドオンを削除できます。*
   * *ユーザは当該アドオンを無効化できます。*
 * 当該アドオンは自動アップデートされます。
 * Add-on SDKベースのアドオン、再起動不要なアドオンも、この方法でインストールできます。

#### その他のパターン

上記の3パターン以外にも、アドオンを管理者がインストールするための方法はいくつかあります。詳細は以下の開発者向け情報を参照して下さい。

 * [Installing extensions - Mozilla | MDN](https://developer.mozilla.org/en-US/Add-ons/Installing_extensions?redirectlocale=en-US&amp;redirectslug=Installing_extensions )（英語）







# 複数バージョンの併用



## FirefoxやThunderbirdを別のプロファイルで同時に起動したい

キーワード：導入時初期設定

Firefox（およびThundebrird）は通常、既にFirefoxが起動している状態でもう一度Firefoxをショートカット等から起動しようとすると、既に起動しているFirefoxにおいて新しいウィンドウを開くという操作になります。
Firefoxの実行ファイルに対して起動オプションを与えることで、異なるユーザープロファイルでFirefoxを同時に起動することができます。

### 設定方法

例として、（設定の検証などに使用する）新規プロファイル環境のFirefoxを同時に起動できるようにする手順を示します。

 1. プロファイル情報保存用のフォルダを任意の位置に作成します。
    ここでは例として、`%AppData%\Mozilla\Firefox\Profiles\another` に作成することにします。
 2. Firefoxを起動するためのショートカットをデスクトップ上にコピーし、任意の名前に変更します。
    ここでは例として、`Firefox Another` とします。
 3. 2.で作成した新しいショートカットのプロパティを開き、`リンク先` に記載されているFirefoxの実行ファイルへのパスの後に、` -no-remote -profile "（1.で作成したフォルダのパス）"` というオプションの指定を加えます。
     Firefoxが `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、最終的なリンク先は以下のようになります。
     
         "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" -no-remote -profile "%AppData%\Mozilla\Firefox\Profiles\another"

以上で、同じバージョンのFirefoxを別々のプロファイルで同時に起動できるようになります。
通常のショートカットで起動すると今まで通りのFirefoxが、上記手順で作成したショートカットで起動すると新規プロファイルの環境のFirefoxがそれぞれ起動します。

なお、他のアプリケーションでリンクを開こうとした場合や、URLショートカットを開こうとした場合には、上記手順で作成した新規プロファイルではなく、既存プロファイルのFirefoxが起動します。



## 複数のバージョンのFirefoxやThunderbirdを併用し、同時に起動したい

キーワード：導入時初期設定

Firefoxの実行ファイルに対して起動オプションを与えることで、異なるバージョンのFirefoxを同時に起動することができます。

### 設定方法

例として、通常リリース版のFirefoxがインストールされている環境で、ESR版Firefoxを同時に起動できるようにする手順を示します。

 1. 起動中のFirefoxのウィンドウをすべて閉じ、終了します。
 2. 新たにインストールしたいバージョンのFirefoxのインストーラを起動します。
 3. 「カスタムインストール」を選択し、インストール先を今まで使用していたバージョンのFirefoxとは異なる位置に指定します。
    ここでは例として、`C:\Program Files (x86)\Mozilla Firefox ESR` にインストールすることにします。
    また、この時デスクトップおよびスタートメニューのショートカットは作成しないようにします。
    （既存のショートカットを上書きしないため）
 4. ESR版Firefox起動専用のプロファイル情報保存用のフォルダを任意の位置に作成します。
    ここでは例として、`%AppData%\Mozilla\Firefox\Profiles\esr` に作成することにします。
 5. 3.でインストールしたFirefoxの実行ファイルへのショートカットをデスクトップ上に作成し、任意の名前を付けます。
    ここでは例として、「Firefox ESR」とします。
 6. 5.で作成した新しいショートカットのプロパティを開き、「リンク先」に記載されているFirefoxの実行ファイルへのパスの後に、` -no-remote -profile "（5.で作成したフォルダのパス）"` というオプションの指定を加えます。
    ここまでの手順の例に則ると、最終的なリンク先は以下のようになります。
     
         "C:\Program Files (x86)\Mozilla Firefox ESR\firefox.exe" -no-remote -profile "%AppData%\Mozilla\Firefox\Profiles\esr"

以上で、通常リリース版のFirefoxとESR版Firefoxを同時に起動できるようになります。
通常のショートカットで起動すると今まで通りのFirefoxが、上記手順で作成したショートカットで起動するとESR版のFirefoxがそれぞれ起動します。

なお、他のアプリケーションでリンクを開こうとした場合や、URLショートカットを開こうとした場合には、上記手順でセットアップしたESR版Firefoxではなく、通常リリース版（既存プロファイル）のFirefoxが起動します。






# 情報漏洩対策

## 社外サイトへアクセスする機能を全て無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxにはネットワーク上のサーバと連携する機能が多数含まれています。情報漏洩対策その他の理由から外部ネットワークへの意図しない通信を行わないようにしたい場合には、各機能を無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。


    // アプリケーション自体の自動更新のURL
    lockPref("app.update.url", "");
    lockPref("app.update.url.details", "");
    lockPref("app.update.url.manual", "");
    
    // プラグインのブロック時などの詳細説明のURL
    lockPref("app.support.baseURL", "");
    // Webサイトの互換性情報のURL
    lockPref("breakpad.reportURL", "");
    // about:homeに表示するアドバイス情報の取得元URL
    lockPref("browser.aboutHomeSnippets.updateUrl", "");
    
    // Webサービスとの連携
    // Webフィード用のサービス
    lockPref("browser.contentHandlers.types.0.uri", "");
    lockPref("browser.contentHandlers.types.1.uri", "");
    pref("browser.contentHandlers.types.2.uri", "");
    pref("browser.contentHandlers.types.3.uri", "");
    pref("browser.contentHandlers.types.4.uri", "");
    pref("browser.contentHandlers.types.5.uri", "");
    // IRC用のサービス
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
    
    // オートコレクト用辞書の取得先URL
    lockPref("browser.dictionaries.download.url", "")
    
    // 位置情報サービスの説明用URL
    lockPref("browser.geolocation.warning.infoURL", "");
    // 位置情報をWi-Fiアクセスポイントから取得するためのURL
    lockPref("geo.wifi.uri", "");
    
    // SSLの有無が混在しているページでの警告文のURL
    lockPref("browser.mixedcontent.warning.infoURL", "");
    
    // 検索プロバイダ（検索エンジン）の自動更新を無効化
    lockPref("browser.search.update", false);
    
    // Google Safe Browsing機能
    lockPref("browser.safebrowsing.enabled", false);
    lockPref("browser.safebrowsing.malware.enabled", false);
    lockPref("browser.safebrowsing.gethashURL", "");
    lockPref("browser.safebrowsing.keyURL", "");
    lockPref("browser.safebrowsing.malware", "");
    lockPref("browser.safebrowsing.reportErrorURL", "");
    lockPref("browser.safebrowsing.reportGenericURL", "");
    lockPref("browser.safebrowsing.reportMalwareErrorURL", "");
    lockPref("browser.safebrowsing.reportMalwareURL", "");
    lockPref("browser.safebrowsing.reportPhishURL", "");
    lockPref("browser.safebrowsing.reportURL", "");
    lockPref("browser.safebrowsing.updateURL", "");
    lockPref("browser.safebrowsing.warning.infoURL", "");
    
    // 検索プロバイダ（検索エンジン）の取得元URL
    lockPref("browser.search.searchEnginesURL", "");
    
    // 統計情報送信用の機能
    lockPref("datareporting.healthreport.service.enabled", false);
    lockPref("datareporting.healthreport.uploadEnabled", false);
    lockPref("datareporting.healthreport.about.reportUrl", "");
    lockPref("datareporting.healthreport.documentServerURI", "");
    lockPref("datareporting.healthreport.infoURL", "");
    
    // Webアプリケーションのインストールを許可するドメイン
    lockPref("dom.mozApps.signed_apps_installable_from", "");
    
    // 危険なアドオンのブロックリスト
    lockPref("extensions.blocklist.enabled", false);
    lockPref("extensions.blocklist.detailsURL", "");
    lockPref("extensions.blocklist.itemURL", "");
    lockPref("extensions.blocklist.url", "");
    
    // Mozilla Add-onsから新しいアドオンを検索するのを禁止
    lockPref("extensions.getAddons.get.url", "");
    lockPref("extensions.getAddons.getWithPerformance.url", "");
    lockPref("extensions.getAddons.recommended.url", "");
    lockPref("extensions.getAddons.search.browseURL", "");
    lockPref("extensions.getAddons.search.url", "");
    
    // アドオンの自動更新
    lockPref("extensions.update.enabled", false);
    lockPref("extensions.update.background.url", "");
    lockPref("extensions.update.url", "");
    // Firefoxのアップデート後に行われるアドオンの互換性確認を併せて無効化する。
    // （そうしないと、アドオンの互換性確認でFirefoxがフリーズしてしまう）
    lockPref("extensions.showMismatchUI", false);
    
    // アドオンマネージャから新しいアドオンを探すためのURL
    lockPref("extensions.webservice.discoverURL", "");
    
    // プラグインのインストール情報、更新情報の取得元URL
    lockPref("pfs.datasource.url", "");
    lockPref("plugins.update.url", "");
    
    // Firefox Sync
    lockPref("services.sync.account", "");
    lockPref("services.sync.username", "");
    lockPref("services.sync.jpake.serverURL", "");
    lockPref("services.sync.privacyURL", "");
    lockPref("services.sync.serverURL", "");
    lockPref("services.sync.statusURL", "");
    lockPref("services.sync.syncKeyHelpURL", "");
    lockPref("services.sync.termsURL", "");
    
    // SNS連携機能
    lockPref("social.enabled", false);
    lockPref("social.directories", "");
    lockPref("social.whitelist", "");
    
    // スタートページ
    lockPref("startup.homepage_welcome_url", "");
    
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

クラッシュレポーターを無効化する方法は複数あります。

<!--
http://mxr.mozilla.org/mozilla-central/source/toolkit/crashreporter/nsExceptionHandler.cpp#1861
-->

#### Windowsのレジストリを使用する

Windowsのレジストリキー `HKEY_LOCAL_MACHINE\Software\Mozilla\Firefox\Crash Reporter` または `HKEY_CURRENT_USER\Software\Mozilla\Firefox\Crash Reporter` について、DWORD型の値 `SubmitCrashReport` を作成し、データを `0` に設定します。

#### OS Xのアプリケーションごとの設定を使用する

`Mozilla Crash Reporter` の設定 `submitReport` について、値を`false` にします。

#### Linuxのユーザ固有の設定を使用する

`~/.mozilla/firefox/Crash Reports/crashreporter.ini` の位置に以下の内容のテキストファイルを置きます。

    [Crash Reporter]
    SubmitReport＝0

#### 環境変数を使用する場合

環境変数 `MOZ_CRASHREPORTER_DISABLE` の値を `1` に設定した状態でFirefoxを起動するとクラッシュレポータが無効化されます。この指定は上記の設定よりも優先され、どのプラットフォームにおいても利用できます。






## 利用時の統計情報を送信させたくない

キーワード：導入時初期設定、情報漏洩対策

Firefoxには、利用時におけるメモリの使用状況などの性能に関する統計情報を収集してサーバに送信する機能が含まれています。この仕組みは初期状態で無効化されており、ユーザの確認の上で有効化されますが、最初から無効の状態に固定しておくことができます。

### 送信される情報の内容

どのような情報が統計情報として送信されるかは、[プライバシーポリシー](http://www.mozilla.jp/legal/privacy/firefox/#telemetry)を参照して下さい。個人や組織の特定に繋がりうる情報としては、統計情報に付随してIPアドレスが送信されます。

### 設定方法

以下は、統計情報を送信しない設定で固定する場合の、[MCD（AutoConfig）](#mcd)での設定例です。

    if (typeof getPref("toolkit.telemetry.prompted") == "boolean")
      clearPref("toolkit.telemetry.prompted");
    lockPref("toolkit.telemetry.prompted", 2);
    lockPref("toolkit.telemetry.rejected", true);
    lockPref("datareporting.healthreport.uploadEnabled", false);
    lockPref("datareporting.policy.dataSubmissionEnabled", false);



## フォームのオートコンプリート機能を無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxのオートコンプリート機能（テキストボックスに入力した内容を保存しておき、次回以降の入力を省略する機能）は無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    // Webページ上のフォーム要素、およびWeb検索バーのオートコンプリート機能の無効化
    lockPref("browser.formfill.enable", false);

なお、この設定を反映しても、既に保存されている入力履歴の削除までは行われません。




## スマートロケーションバーを無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxのスマートロケーションバー機能（ロケーションバーから過去の閲覧履歴等を検索する機能）は無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    // スマートロケーションバーのオートコンプリート機能の無効化
    lockPref("browser.urlbar.autocomplete.enabled", false);

なお、この設定を反映しても、既に保存されている入力履歴や閲覧履歴の削除までは行われません（単に表示されなくなります）。





## パスワードを保存させたくない（パスワードマネージャを無効化したい）

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

FirefoxおよびThunderbirdのパスワードマネージャ機能は無効化することができます。

### 設定方法

パスワードマネージャの利用を禁止する最も簡単な方法は、アドオン [Do Not Save Password][]を使うことです。
[管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってDo Not Save Passwordを導入すると、以下の効果を得ることができます。

 * パスワードマネージャ機能を無効化し、パスワードの保存を禁止する。
 * 既にパスワードマネージャに保存されてしまっているパスワードをすべて消去する。

また、既に保存されてしまっているパスワードについては特に削除しなくてもよい（それ以後のパスワードの保存を禁止するのみでよい）のであれば、[MCD（AutoConfig）](#mcd)などを使って以下の設定を反映することによってパスワードマネージャを無効化できます。

    lockPref("signon.rememberSignons", false);






## セッション機能を無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxのセッション関連機能はある程度まで無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    // Firefox起動時の表示ページの設定。
    // 3にすると前回セッションの復元となるので、それ以外を選択する。
    lockPref("browser.startup.page", 0);
    // Firefoxやアドオンの更新後の再起動などでの1回だけのセッション復元を禁止する
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

この設定により、ディスク上に保存されるセッション情報は最小限の物となります。

### 注意事項

現在のバージョンのFirefoxでは、セッション管理機構自体を無効化することはできません。
`about:home` での「以前のセッションを復元」機能のために、前回のセッション情報は常にディスク上に保存されます。

セッションを一切保存しないようにすることはできませんが、[globalChrome.css][]を使うなどしてボタンを非表示にして、セッションを復元する手段へのアクセスを禁じることはできます。globalChrome.css を使う場合の手順は以下の通りです。

 1. 「メモ帳」などのテキストエディタを開き、以下のスタイル指定を記述します。
    
        @-moz-document url-prefix("about:home"),
                       url-prefix("chrome://browser/content/abouthome/aboutHome.xhtml") {
          *|*#restorePreviousSessionSeparator,
          *|*#restorePreviousSession {
            visibility: collapse !important;
            -moz-user-focus: ignore !important;
          }
        }
    
    （ `@-moz-document` は、特定のウィンドウに対してのみスタイル指定を反映させるための記述です。詳細は[@-moz-document について参考][]を参照して下さい。）
 2. 1で作成した内容を `globalChrome.css` という名前のプレーンテキストファイルに保存します。
 3. 2で作成したファイルをFirefoxのインストール先の `chrome` フォルダに設置します。
    （Windows Vista以降の場合のファイルの設置場所は `C:\Program Files (x86)\Mozilla Firefox\chrome\globalChrome.css` となる。）
 4. [管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従って[globalChrome.css][]を導入します。

ただしこの場合においても、単にユーザーが手動操作でセッションを復元できなくなるだけであり、ディスク上にはセッション情報が依然として保存される状態であることにはご注意下さい。




## 検索エンジン（Googleなど）の候補の推測表示を無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

FirefoxのWeb検索バーはGoogleなどの検索における検索語句の候補の表示に対応していますが、この機能は無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    lockPref("browser.search.suggest.enabled", false);





## 位置情報取得API（Geolocation）を無効化したい

キーワード：機能制限、導入時初期設定、集中管理、情報漏洩対策

Firefoxは地図などのWebサービスに対して現在位置の情報を通知する機能を含んでいますが、この機能は無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    lockPref("geo.enabled", false);




# ユーザが使える機能を制限したい



## 一部のキーボードショートカットを無効化したい {#disable-keyboard-shortcuts}

キーワード：機能制限、導入時初期設定、集中管理

Firefoxはキーボードショートカットを管理する機能を含んでいませんが、アドオンを使うことによって、キーボードショートカットの割り当てを変更したりショートカットを無効化したりできます。

個人での利用の場合は[Customizable Shortcuts][]が有用ですが、本項執筆時点のバージョンでは、管理者が行った設定を全体に展開するという用途には残念ながら向いていません。そこで本項では代わりに[UI Text Overrider][]を使った設定の手順を解説します。

### 設定方法

大まかな手順は以下の通りです。

 1. [DOM Inspector][] をインストールします。
 2. `ツール`→`Web開発`→`DOM Inspector`でDOM Inspectorを起動します。
 3. `File`→`Inspect Chrome Document`を選択し、ブラウザのウィンドウのタイトルと同じ項目を選択します。
 3. `<window>` 直下の`<keyset id="devtoolsKeyset">` や `<keyset id="mainKeyset">` を選択し、サブツリーを展開します。
 4. `<keyset>` 直下に多数ある `<key>` から目的のショートカットを定義している物を見つけ出します。
 5. [MCD（AutoConfig）](#mcd)を使用し、UI Text Overriderで当該ショートカットを無効化するための設定を行います。
 6. [管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってUI Text Overriderを導入します。

Ctrl-T（新しいタブを開く）に対応する `<key>` を例として、4および5の詳細な手順を説明します。以下はCtrl-Tのショートカットを定義している `<key>` です。

    <key id="key_newNavigatorTab"
         key="t"
         modifiers="accel"
         command="cmd_newNavigatorTab"/>

`<key>` は、 `key` または `keycode` のいずれかの属性を持ちます。アルファベットや記号など通常の文字入力用のキーを使うショートカットでは `key` 属性の値にそのキーの文字が指定されており、F1などのファンクションキーやTab、BackSpaceなどの特殊なキーを使うショートカットでは `keycode` 属性の値にそのキーの仮想キーコード名（ `VK_TAB` や `VK_BACK` など。一覧は[KeyboardEvent - Web API interfaces](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Virtual_key_codes)を参照して下さい)が指定されています。

また、Ctrlキーなどの修飾キーを伴うショートカットでは、 `modifiers` 属性に修飾キーが指定されています。`modifiers` 属性の値は修飾キー名のカンマ区切りのリストで、 `alt`, `control`, `meta`（MacのCommandキーに対応）, `shift`, および `accel`（Macでは `meta` と見なされ、それ以外の環境では `control` と見なされる）のうちの1つ以上の組み合わせとなります。

上記の情報を手がかりにして、挙動を変えたいキーボードショートカットに対応する `<key>` を探します。見つかったら、それを無効化するための設定を[MCD（AutoConfig）](#mcd)の設定ファイルに記述します。凡例は以下の通りです。

    lockPref("extensions.uitextoverrider@clear-code.com.<定義名>",
      "要素を特定するためのCSSセレクタ");
    lockPref("extensions.uitextoverrider@clear-code.com.<定義名>.<属性名1>",
      "値");
    lockPref("extensions.uitextoverrider@clear-code.com.<定義名>.<属性名2>",
      "値");
    ...

先のCtrl-Tを無効化する場合は、以下のようになります。

    lockPref("extensions.uitextoverrider@clear-code.com.newNavigatorTab",
      "#key_newNavigatorTab"); // IDセレクタを使用
    lockPref("extensions.uitextoverrider@clear-code.com.newNavigatorTab.disabled",
      "true"); // disabled属性をtrueに設定し、ショートカットを無効化する
    lockPref("extensions.uitextoverrider@clear-code.com.newNavigatorTab.command",
      ""); // コマンドの割り当てを無くし、万が一にも動作しないようにする


### 注意事項

UI Text Overriderを使った方法では、挙動を変更できるのはFirefoxのUI上で `<key>` が定義されているキーボートショートカットのみとなります。例えば以下のようなショートカットは挙動を変更できません。

 * Ctrl-←, →, ↑, ↓
 * Ctrl-F4（ウィンドウまたはタブを閉じる）
 * F7（キャレットブラウズモードを切り替える）
 * Alt（メニューバーを表示する）
 * F10（メニューバーにフォーカスする）
 * Home（ページ先頭にスクロールする）
 * End（ページ末尾にスクロールする）

このようなショートカットを無効化するためには、 userChrome.jsスクリプトや独自開発のアドオンなどを使う必要があります。





## 一部のメニュー項目やツールバーボタンなどのUI要素を非表示にしたい {#hide-ui-elements}

キーワード：機能制限、導入時初期設定、集中管理

アドオンを使うことで、Firefoxの特定のUI要素を画面上に表示しないようにしてユーザによる操作を禁止することができます。

### 設定方法

UI要素を隠すためには、[globalChrome.css][]などのアドオンを使ってUI要素を隠すスタイル指定を適用する必要があります。globalChrome.css を使う場合の手順は以下の通りです。

 1. [DOM Inspector][] をインストールします。
 2. `ツール`→`Web開発`→`DOM Inspector`でDOM Inspectorを起動します。
 3. `File`→`Inspect Chrome Document`を選択し、ブラウザのウィンドウのタイトルと同じ項目を選択します。
 3. ツリーを展開していくか、もしくはツールバーの左端にある「Find a node to inspect by clickinc on it」ボタンをクリックした後にブラウザウィンドウの非表示にしたいUI要素をクリックするかして、非表示にしたいUI要素の詳細を表示します。
 4. UI要素のIDもしくは他の要素と類似していない特徴を調べる。
 5. 「メモ帳」などのテキストエディタを開き、4で調べた情報を使って項目を非表示にするスタイル指定を記述します。
    
    以下は メニューバーを非表示にする場合の例。
    
        @-moz-document url-prefix(chrome://browser/content/browser.xul) {
          #toolbar-menubar,
          #toolbar-menubar * /* 子孫要素も同様に非表示および無効化する */ {
            /* display:none はDOMツリーに変化を与えて挙動を壊す恐れがあるため、
               単に非表示にするのみとする。 */
            visibility: collapse !important;
            -moz-user-focus: ignore !important;
          }
        }
    
    （ `@-moz-document` は、特定のウィンドウに対してのみスタイル指定を反映させるための記述です。詳細は[@-moz-document について参考][]を参照して下さい。）
 6. 5で作成した内容を `globalChrome.css` という名前のプレーンテキストファイルに保存します。
 7. 6で作成したファイルをFirefox（Thunderbird）のインストール先の `chrome` フォルダに設置します。
    （Windows Vista以降の場合のファイルの設置場所は `C:\Program Files (x86)\Mozilla Firefox\chrome\globalChrome.css` となる。）
 8. [管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従って[globalChrome.css][]を導入します。





## プライベートブラウジング機能を使わせたくない

キーワード：機能制限、情報漏洩対策

プライベートブラウジング機能へのアクセス経路を無効化することで、ユーザのプライベートブラウジング機能の利用を禁止できます。

### ウィザードでの実現

[CCK2 Wizard](#cck)を使用すると、プライベートブラウジング機能の利用を禁止する機能を含むアドオンを作成することができます。

### MCD用設定ファイルでの実現

[MCD（AutoConfig）](#mcd)を使い、プライベートブラウジングモードで起動する機能を無効化します。設定は以下の通りです。

    lockPref("browser.privatebrowsing.autostart", false);

[一部のメニュー項目やツールバーボタンなどのUI要素を非表示にしたい](#hide-ui-elements)の手順に則り、プライベートブラウジングを開始するためのメニュー項目を非表示にします。[globalChrome.css][]を使う場合の設定は以下の通りです。

    @-moz-document url-prefix(chrome://browser/content/browser.xul) {
      #menu_newPrivateWindow,
      #appmenu_newPrivateWindow {
        visibility: collapse !important;
        -moz-user-focus: ignore !important;
      }
    }

[一部のキーボードショートカットを無効化したい](#disable-keyboard-shortcuts)の手順に則り、プライベートブラウジングを開始するためのキーボードショートカットを無効化します。[UI Text Overrider][]と[MCD（AutoConfig）](#mcd)を併用する場合の設定は以下の通りです。

    lockPref("extensions.uitextoverrider@clear-code.com.privateBrowsing",
      "#key_privatebrowsing");
    lockPref("extensions.uitextoverrider@clear-code.com.privateBrowsing.disabled",
      "true");
    lockPref("extensions.uitextoverrider@clear-code.com.privateBrowsing.command",
      "");


また、[CCK2 Wizard](#cck)でも同様のカスタマイズが可能です。




## Firefox Syncを使わせたくない

キーワード：機能制限、導入時初期設定、集中管理

無用なトラブルや情報の流出を避けるため、ユーザが任意にFirefox Syncをセットアップできないよう設定することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck)を使用すると、Firefox Syncの利用を禁止する機能を含むアドオンを作成することができます。

### MCD用設定ファイルでの実現

CCK2 Wizard以外でFirefox Syncの利用を禁止する方法としては、アドオン [Disable Sync][]を使う方法があります。
[管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってDisable Syncを導入すると、以下の操作が完全に禁止されます。

 * ユーザがFirefox Syncの初期設定を行う。
 * ユーザがFirefox Syncのツールバーボタンを追加する。
 * ユーザが手動で情報を同期する。
 * Firefoxが自動的に情報を同期する。

[CCK2 Wizard](#cck)でも同様のカスタマイズが可能です。

また、単に通信を無効化するだけであれば、[MCD（AutoConfig）](#mcd)などを使って以下の設定を反映することによっても実現可能です。

    lockPref("services.sync.serverURL", "");
    lockPref("services.sync.jpake.serverURL", "");
    lockPref("services.sync.termsURL", "");
    lockPref("services.sync.privacyURL", "");
    lockPref("services.sync.statusURL", "");
    lockPref("services.sync.syncKeyHelpURL", "");

### 注意事項

Disable Syncは、既に同期済みの設定を消去しません。
既にユーザがFirefox Syncを利用しており、サーバおよび他のクライアントに設定を同期している場合、それらは別途削除する必要があります。







# 自動アップデート




## Firefox・Thunderbirdの自動アップデートを禁止したい

キーワード：機能制限、集中管理、自動アップデート

無用なトラブルを避けるため、ユーザが使用中にFirefoxやThunderbirdが自動アップデートを行わないよう設定することができます。

### 設定方法

FirefoxやThunderbirdの自動アップデートを禁止する最も簡単な方法は、アドオン [Disable Auto Update][]を使うことです。
[管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってDisable Auto Updateを導入すると、以下の機能が完全に無効化されます。

 * FirefoxおよびThunderbirdが定期的に自身のアップデート情報を取得する。
 * Firefoxが検索エンジンの自動アップデート情報を取得する。
 * 「オプション」から自動アップデートの設定を変更する。

また、単に自動アップデート情報の取得処理を無効化するだけであれば、[MCD（AutoConfig）](#mcd)などを使って以下の設定を反映することによっても実現可能です。

    lockPref("app.update.auto", false);
    lockPref("app.update.enabled", false);
    lockPref("browser.search.update", false);




## Firefox・Thunderbirdの自動アップデートについて、メジャーアップデートは禁止し、マイナーアップデートのみ自動で適用したい

キーワード：機能制限、集中管理、自動アップデート

FirefoxやThunderbirdのESR版は通常、あるメジャーバージョンのサポートが終了すると、自動アップデート経由で次のメジャーバージョンにアップデートされます。例えばFirefox 17.0.11ESRは、順次Firefox 24ESRへアップデートされます。

このようなメジャーバージョンの変更を伴う自動アップデートの適用を禁止し、マイナーバージョンの変更のみを適用するよう設定することができます。

### 設定方法

FirefoxやThunderbirdのメジャーアップデートを禁止する最も簡単な方法は、アドオン [Only Minor Update][]を使うことです。
[管理者によるアドオンのインストール手順](#install-addons-by-administrator)に従ってOnly Minor Updateを導入すると、メジャーバージョンが異なるアップデートは適用されないようになります。

### 注意事項

このアドオンは、内部的に `app.update.url.override` を上書きします。そのため、この設定を用いて自動アップデート情報の提供元を変更するカスタマイズとの併用はできません。
自動アップデート情報の提供元を変更する場合は、提供する自動アップデート情報の側で、マイナーアップデートの情報のみを提供する形で運用して下さい。





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

Firefox 24.1.1ESRが導入済みのクライアントをFirefox 24.2.0ESRに更新するための情報およびファイルを静的なファイルとして提供する場合を例として、手順を説明します。

 1. アップデート用のアーカイブファイルをMozillaのFTPサーバから入手します。
    * FTPサーバ上には各バージョンのアップデート用差分ファイル、完全アップデート用アーカイブファイルが保存されており、以下のようなURLでダウンロードすることができます。
      [ftp://ftp.mozilla.org/pub/mozilla.org/firefox/releases/24.2.0esr/update/win32/ja/](ftp://ftp.mozilla.org/pub/mozilla.org/firefox/releases/24.2.0esr/update/win32/ja/)
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
    
    例えばFirefox 24.2ESRへの更新で、ハッシュをSHA-512で用意するのあれば、以下のようになります。
    
        <?xml version="1.0"?>
        <updates>
          <update type="minor"
                  displayVersion="24.2.0esr"
                  appVersion="24.2.0"
                  platformVersion="24.2.0"
                  buildID="20131205180928"
                  actions="silent">
            <patch type="complete"
                   URL="marファイルのダウンロード用URL"
                   hashFunction="SHA512"
                   hashValue="marファイルのSHA-512ハッシュ"/>
          </update>
        </updates>
    
 4. 3で用意したファイルをクライアント上のローカルファイル、ファイル共有サーバ上のファイル、HTTPサーバ上のファイルのいずれかの形で設置し、クライアントから取得できるようにします。
 5. [MCD（AutoConfig）](#mcd)などを使って、文字列型の設定 `app.update.url.override` の*ユーザ設定値*に4で設置したファイルのURL文字列を指定します。
    * ローカルファイルやファイル共有サーバ上のファイルである場合は、`file:///` から始まるファイルURLを指定します。
    * MCDを使う場合、ディレクティブとしては `lockPref()` や `defaultPref()` ではなく `pref()` を使用します。

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






## アドオンの自動アップデートの提供タイミングを組織内で制御したい

キーワード：機能制限、集中管理、自動アップデート、アドオン

通常、FirefoxやThunderbirdはMozillaが公式に提供しているアドオンのアップデート情報に基づいてアドオンの自動アップデートを行いますが、設定変更により、組織内のサーバなどをアップデート情報の提供元にすることができます。これにより、アドオンの自動アップデートの適用タイミングを制御できます。

### 設定方法

 1. 以下のような内容で、自動アップデート情報提供用のXMLファイル `update.rdf` を用意します。
    
        <?xml version="1.0" encoding="UTF-8"?>
        <RDF:RDF xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                 xmlns:em="http://www.mozilla.org/2004/em-rdf#">
          <RDF:Description about="urn:mozilla:extension:アドオンのID">
            <em:updates>
              <RDF:Seq>
                <RDF:li>
                  <RDF:Description>
                    <em:version>アドオンのバージョン</em:version>
                    <em:targetApplication>
                      <RDF:Description>
                        <em:id>対象アプリケーションのID</em:id>
                        <em:minVersion>最小バージョン</em:minVersion>
                        <em:maxVersion>最大バージョン</em:maxVersion>
                        <em:updateLink>XPIファイルのダウンロード用URL</em:updateLink>
                        <em:updateHash>ハッシュ関数名:XPIファイルのハッシュ値</em:updateHash>
                      </RDF:Description>
                    </em:targetApplication>
                  </RDF:Description>
                </RDF:li>
              </RDF:Seq>
            </em:updates>
          </RDF:Description>
        </RDF:RDF>
    
    例えばFirefox 24.2ESR向けのアドオンとして[DOM Inspector][]の更新情報を提供するのであれば以下のようになります。
    
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
                        <em:updateHash>sha1:ファイルのSHA1ハッシュ</em:updateHash>
                      </RDF:Description>
                    </em:targetApplication>
                  </RDF:Description>
                </RDF:li>
              </RDF:Seq>
            </em:updates>
          </RDF:Description>
        </RDF:RDF>
    
 2. 1で用意したファイルをクライアント上のローカルファイル、ファイル共有サーバ上のファイル、HTTPサーバ上のファイルのいずれかの形で設置し、クライアントから取得できるようにします。
 3. [MCD（AutoConfig）](#mcd)などを使って、文字列型の設定 `extensions.update.url` の値に、2で設置したファイルのURL文字列を指定します。

以上で更新情報の提供準備ならびにクライアントの設定は完了です。以後は、サーバ上に設置した `update.rdf` ならびに各アドオンのXPIファイルを適宜更新するようにして下さい。

詳細な情報は[Extension Versioning, Update and Compatibility | MDN](https://developer.mozilla.org/ja/docs/Extension_Versioning,_Update_and_Compatibility#.E3.82.A2.E3.83.83.E3.83.97.E3.83.87.E3.83.BC.E3.83.88_RDF_.E3.81.AE.E5.BD.A2.E5.BC.8F)を参照して下さい。

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

`override.ini` という名前で以下の内容のテキストファイルを作成し、Firefoxであればインストール先ディレクトリ内の `browser` ディレクトリ内（Windowsであれば、`C:\Program Files (x86)\Mozilla Firefox\browser\override.ini` など）、Thunderbirdであればインストール先ディレクトリ直下（Windowsであれば、`C:\Program Files (x86)\Mozilla Thunderbird\override.ini` など）に置きます。

    [XRE]
    EnableProfileMigrator=false




## アップデート後の「お使いのFirefoxは最新版に更新されました」タブを表示させたくない

キーワード：導入時初期設定

Firefoxを更新した後の初回起動時に表示される「お使いのFirefoxは最新版に更新されました」タブは、設定で無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    lockPref("browser.startup.homepage_override.mstone", "ignore");





## アップデート後の「Thunderbirdへようこそ」（新着情報）タブを表示させたくない

キーワード：導入時初期設定

Thunderbirdを更新した後の初回起動時に表示される「Thunderbirdへようこそ」タブは、設定で無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    clearPref("app.update.postupdate");

上記の設定は、設定値の内容に関わらず、ユーザ設定値が保存されていると「Thunderbirdへようこそ」タブが開かれるという仕様になっています。そのため、明示的に `false` を指定する代わりにユーザ設定値を消去する必要があります。




## 「あなたの権利について」を表示させたくない

キーワード：導入時初期設定

FirefoxやThunderbirdの初回起動時などに表示される「あなたの権利について」のメッセージは、設定で無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。FirefoxとThunderbirdで設定名が異なることに注意して下さい。

    // Firefoxの場合
    lockPref("browser.rights.override", true);
    
    // Thunderbirdの場合
    lockPref("mail.rights.override", true);





<!--
## ダウンロード完了の通知を表示させたくない（未稿）
  autoconfig
旧ダウンロードマネージャが廃止されたので、これはこのままでは書けない気がする。
何のために通知を表示させたくないのか、ということを汲み取って、新しいUIでその目的を達成するためのカスタマイズを考える必要がある。
-->



## プラグインのインストールを促すメッセージを表示させたくない

キーワード：導入時初期設定

FirefoxでFlashやJavaなどのプラグインを使用したページを閲覧する際に表示される、プラグインのインストールを促すメッセージは、設定で無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    lockPref("plugins.hide_infobar_for_missing_plugin", true);


<!--
lockPref("plugins.hide_infobar_for_outdated_plugin", true);
plugins.hide_infobar_for_outdated_plugin は、現在のFirefoxでは対応する実装が存在していない模様。
-->





## タブを閉じようとしたときの警告を表示させたくない

キーワード：導入時初期設定

Firefoxでウィンドウや複数のタブを一度に閉じようとした時に表示される、本当に閉じてもよいかどうかの確認ダイアログは、設定で無効化することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    // 複数のタブを開いた状態でウィンドウを閉じようとした時の確認を表示しない
    lockPref("browser.tabs.warnOnClose", false);
    // 「他のタブを閉じる」で複数のタブを一度に閉じようとした時の確認を表示しない
    lockPref("browser.tabs.warnOnCloseOtherTabs", false);







# 初期設定の変更




## 既定のホームページを変更したい

キーワード：導入時初期設定

Firefoxを起動した時に表示される最初のページはユーザが自由に変更できますが、変更するまでの間は初期設定が使われ、また、`初期設定に戻す` で最初の状態に戻すことができます。この時の初期設定として使われるページは変更することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    // 例として、Mozilla Japanのページをホームの初期設定とする。
    defaultPref("browser.startup.homepage", "http://mozilla.jp/");

また、[CCK2 Wizard](#cck)でも同様のカスタマイズが可能です。



## 初期状態のブックマークの内容を変更したい

キーワード：導入時初期設定、ブックマーク

Firefoxの初期状態のブックマークの内容は、変更することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck)を使用すると、初期状態のブックマークを変更する機能を含むアドオンを作成することができます。

### 設定ファイルで任意のブックマーク項目を初期状態に追加する

設定ファイルを使用して任意のブックマーク項目を初期状態に追加する手順は以下の通りです。

 1. 後述する内容で、テキストファイル `distribution.ini` を作成します。
 2. Firefoxの実行ファイルと同じ位置に `distribution` という名前でフォルダを作成します。
    Firefoxが `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、作成するフォルダのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution` となります。
 3. 1.で作成したフォルダの中に `distribution.ini` を設置します。
    最終的なファイルのパスは `C:\Program Files (x86)\Mozilla Firefox\distribution\distribution.ini` となります。

`distribution.ini` の内容は以下の要領で記述します。なお、日本語を記述する場合は文字エンコーディングをUTF-8にしてファイルを保存して下さい。

    [Global]
    ; カスタマイズ済みFirefoxを識別する一意な名前。
    id=our-customized-firefox
    ; カスタマイズのバージョン。
    version=1.0
    ; 「Mozilla Firefoxについて」に表示される説明文。
    about=Customized Version
    ; 初期化が完了したことを保持する設定の名前。
    bookmarks.initialized.pref=distribution.ini.boomkarks.initialized
    
    ; ブックマークツールバーへの追加項目
    [BookmarksToolbar]
    item.1.title=ブックマーク1のタイトル
    item.1.link=ブックマーク1のURL
    item.1.description=ブックマーク1の説明文（省略可）
    ; 添字を変えて複数の項目を登録できる
    item.2.title=ブックマーク2のタイトル
    item.2.link=ブックマーク2のURL
    item.2.description=ブックマーク2の説明文（省略可）
    ; セパレータも挿入できる
    item.3.type=separator
    ; フォルダも挿入できる
    item.4.type=folder
    item.4.title=フォルダ名
    ; この「id」を、後の「BookmarksFolder-X」の部分に指定する
    item.4.folderId=1
    
    ; ブックマークメニューへの追加項目
    [BookmarksMenu]
    item.1.type=folder
    item.1.title=フォルダ名その2
    item.1.folderId=2
    
    [BookmarksFolder-1]
    item.1.title=ブックマークツールバーに追加したフォルダ中の項目1のタイトル
    item.1.link=ブックマークツールバーに追加したフォルダ中の項目1のURL
    
    [BookmarksFolder-2]
    item.1.title=ブックマークメニューに追加したフォルダ中の項目1のタイトル
    item.1.link=ブックマークメニューに追加したフォルダ中の項目1のURL

また、[CCK2 Wizard](#cck)でも同様のカスタマイズが可能です。

### 注意事項

`distribution.ini` を使った設定手順では項目を追加することはできますが、削除する事はできません。ブックマークの初期状態を完全に空にしたり、ブックマークの任意の初期項目を削除したりするには、そのためのアドオンを開発するか、userChrome.jsスクリプトなどを使う必要があります。

<!--
%AppDir%\browser\defaults\profile\bookmarks.html を設置すると、アドオンを使わなくてもできる。
-->

<!--
## ブックマークを初期状態で空にしたい（未稿）
  bookmarks.html
%AppDir%\browser\defaults\profile\bookmarks.html を設置するとできる。
-->


<!--
## ブックマークツールバーを初期状態で非表示にしたい（未稿）
  localstore.rdf
%AppDir%\browser\defaults\profile\localstore.rdf を設置するとできる。
-->




## プロキシの設定を固定・強制したい

キーワード：導入時初期設定、機能制限

Firefoxのネットワーク設定において、プロキシの使用を強制することができます。

### ウィザードでの実現

[CCK2 Wizard](#cck)を使用すると、プロキシ設定を自動的に行うアドオンを作成することができます。

### 設定ファイルでプロキシの設定を指定する

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

特定のHTTPプロキシの使用を強制する場合は以下のように設定します。

    lockPref("network.proxy.type", 1);
    lockPref("network.proxy.http", "proxy.hostname");
    lockPref("network.proxy.http_port", 8080);

自動設定スクリプトの使用を強制する場合は以下のように設定します。

    lockPref("network.proxy.type", 2);
    lockPref("network.proxy.autoconfig_url", "http://internal-server/proxy.pac");

また、[CCK2 Wizard](#cck)でも同様のカスタマイズが可能です。



## プロキシを使用しない例外サイト（ドメイン）を指定したい

キーワード：導入時初期設定

Firefoxは、プロキシを使用しない例外サイトを管理する設定UIを持っていません。
その代わり、自動プロキシ設定スクリプト（PACファイル）を使うことで、アクセス先のURLに応じてプロキシを使用するかどうか、どのプロキシを使用するかを細かく制御する事ができます。

### 設定方法

 1. 自動プロキシ設定スクリプト（PACファイル）を作成します。
    記述方法は、[Microsoftの技術資料](http://technet.microsoft.com/ja-jp/library/cc985335.aspx "付録 B : 自動プロキシ構成スクリプトの例")などを参考にして下さい。
 2. 作成した自動プロキシ設定スクリプトをクライアントからアクセス可能な位置に設置し、そのURLを控えます。
    例えば以下の要領です。
    * Webサーバ上に設置する。`http://internal-server/proxy.pac` など。
    * ネットワークドライブ上のファイルやローカルファイルとして設置する。`file:///Z:/firefox/proxy.pac` など。
    * Sambaサーバ、NASなどの上に設置する。`file://///file-server/shared/firefox/proxy.pac` など。
 3. 作成した自動プロキシ設定スクリプトをFirefoxで使用するように設定します。
    * ユーザ固有の設定とする場合は、Firefoxのオプション画面で `詳細`→`ネットワーク`→`接続設定`と辿り、`自動プロキシ設定スクリプトURL`を選択して、2で控えたURLを指定します。
    * 設定を管理者が集中管理する場合は、`network.proxy.type` の値を `2` にした上で、`network.proxy.autoconfig_url` の値に2で控えたURLを指定します。
      例えば[MCD（AutoConfig）](#mcd)では以下の要領です。
      
          lockPref("network.proxy.type", 2);
          lockPref("network.proxy.autoconfig_url", "http://internal-server/proxy.pac");




## 履歴を保存させたくない

キーワード：導入時初期設定、機能制限

FirefoxでのWebページの閲覧履歴について、一切の履歴を保存しないように設定することができます。

### 設定方法

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

    lockPref("places.history.enabled", false);

### 注意事項

過去のバージョンのFirefoxでは日数単位で閲覧履歴の保持期限を設定することができましたが、現在のバージョンのFirefoxでは、閲覧履歴を保存するかしないかの2択となっています。よって、短い期間だけ履歴を保存するということはできません。




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

以下は、[MCD（AutoConfig）](#mcd)での設定例です。

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
    Firefoxが `C:\Program Files (x86)\Mozilla Firefox` にインストールされている場合、最終的なファイルのパスは `C:\Program Files (x86)\Mozilla Firefox\defaults\myCA.crt` となります。

以上で設定は完了です。Firefoxの次回起動時にアドオンがファイルを自動認識し、証明書に設定されたフラグに従って証明書の登録を行います。Firefoxのオプション画面で `詳細`→`証明書`→`証明書を表示`と辿り、証明書が正しく登録されているかどうかを確認して下さい。

また、[CCK2 Wizard](#cck)でも機能の利用を許可するドメインの指定が可能です。

#### 証明書の種類を正しく認識しない場合

Cert Importerが証明書自身に設定されたフラグを正しく認識できなかった場合、ルート証明書がSSLのサイト証明書として登録されるといった結果になることがあります。このような場合は、設定を用いて強制的に証明書の種類を上書き指定することができます。以下は、[MCD（AutoConfig）](#mcd)での設定例です。

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


# Firefox・Thunderbirdにアドオンをバンドルして展開したい

キーワード：導入時初期設定

実行ファイルを1つ実行するだけでFirefoxのインストールとアドオンのインストールをすべて完了するソフトウェアの例としては、[Fx Meta Installer][]があります。
Fx Meta Instlalerの使用方法については、開発元による[Fx Meta Installerのチュートリアル][]などを参照して下さい。

Firefoxのインストール後に別途アドオンをインストールすることによってカスタマイズを完了する形態であれば、[CCK2 Wizard](#cck)によってそのようなアドオンを作成することができます。


# FirefoxにJavaやFlashなどのプラグインをバンドルして展開したい

キーワード：導入時初期設定

実行ファイルを1つ実行するだけでFirefoxのインストールとプラグインのインストールをすべて完了するソフトウェアの例としては、[Fx Meta Installer][]があります。
Fx Meta Instlalerの使用方法については、開発元による[Fx Meta Installerのチュートリアル][]などを参照して下さい。

Firefoxのインストール後に別途アドオンをインストールすることによってカスタマイズを完了する形態であれば、[CCK2 Wizard](#cck)によってそのようなアドオンを作成することができます。



  [Addressbooks Synchronizer]: https://addons.mozilla.org/thunderbird/addon/addressbooks-synchronizer/
  [Always Default Client]: https://addons.mozilla.org/firefox/addon/always-default-client/
  [AutoConfiguration Hook]: https://addons.mozilla.org/thunderbird/addon/autoconfiguration-hook/
  [CCK2 Wizard]: https://addons.mozilla.org/firefox/addon/cck2wizard/
  [Cert Importer]: https://addons.mozilla.org/firefox/addon/cert-importer/
  [Customizable Shortcuts]: https://addons.mozilla.org/firefox/addon/customizable-shortcuts/
  [Disable about:config]: https://addons.mozilla.org/firefox/addon/disable-aboutconfig/
  [Disable Addons]: https://addons.mozilla.org/firefox/addon/disable-addons/
  [Disable Auto Update]: https://addons.mozilla.org/firefox/addon/disable-auto-update/
  [Disable Sync]: https://addons.mozilla.org/firefox/addon/disable-sync/
  [Do Not Save Password]: https://addons.mozilla.org/firefox/addon/do-not-save-password/
  [DOM Inspector]: https://addons.mozilla.org/firefox/addon/dom-inspector-6622/
  [Flex Confirm Mail]: https://addons.mozilla.org/thunderbird/addon/flex-confirm-mail/
  [Force Addon Status]: https://addons.mozilla.org/firefox/addon/force-addon-status/
  [Fx Meta Installer]: https://github.com/clear-code/fx-meta-installer
  [Fx Meta Installerのチュートリアル]: http://www.clear-code.com/blog/2012/11/7.html
  [globalChrome.css]: https://addons.mozilla.org/firefox/addon/globalchromecss/
  [GPO For Firefox]: https://addons.mozilla.org/firefox/addon/gpo-for-firefox/
  [Hide Option Pane]: https://addons.mozilla.org/firefox/addon/hide-option-pane/
  [History Prefs Modifier]: https://addons.mozilla.org/firefox/addon/history-prefs-modifier/
  [IMAPキャッシュの自動消去（Clear IMAP Cache）]: https://addons.mozilla.org/thunderbird/addon/clear-imap-local-cache/
  [Only Minor Update]: https://addons.mozilla.org/firefox/addon/only-minor-update/
  [Permissions Auto Registerer]: https://addons.mozilla.org/firefox/addon/permissions-auto-registerer/
  [UI Text Overrider]: https://addons.mozilla.org/firefox/addon/ui-text-overrider/
  [Windowsショートカットの直接実行（Open Windows Shortcuts Directly）]: https://github.com/clear-code/openshortcuts/releases
  [WinmailOpener]: https://www.google.co.jp/search?q=WinmailOpener
  [Winmail Opener Bridge]: https://addons.mozilla.org/thunderbird/addon/winmail-opener-bridge/
  [不正なアドレスの警告表示パッチ（Patch to Alert Invalid Addresses）]: https://addons.mozilla.org/thunderbird/addon/patch-to-alert-invalid-addr/
  [ローカルファイルからのリンク挿入（Insert Link from Local File）]: https://addons.mozilla.org/thunderbird/addon/insert-link-from-local-file/
  [添付ファイルの文字エンコーディングの自動判別（Attachemnt Encoding Detector）]: https://addons.mozilla.org/thunderbird/addon/attachemnt-encoding-detecto/
  [@-moz-document について参考]: http://www.akatsukinishisu.net/wiki.cgi?%40-moz-document
