# CFP summary

    Sorry, this package supports Japanese only.

国際会議などのCFP (Call for Paper) 情報を管理するアプリケーションです．
ブラウザ上から登録し，アクセス時の日付から投稿可能，開催・採録通知待ち，過去1年に開催された会議の一覧を閲覧できます．


## 利用上の注意

1. このアプリケーション上で認証は行っていません．.htaccessなどによる認証を前提としています．
2. アプリケーションを利用したことに起因する一切の損害を保証しません．

## Setup

    $ npm install

### MySQLユーザ作成

config/db.jsonにMySQLのユーザ情報等を記載します．
作成時に，下記権限を追加してください．

    SELECT, INSERT, UPDATE, DELETE, CREATE

### DB設定

db/mysql_initialize.jsを実行し，データベースとテーブル作成を一括で行います．

    $ cat config/db.json
    $ node db/mysql_initialize.js

### アプリケーション設定

もし立ち上げるNode.jsサーバのURLがルートではない場合，
app.jsonを編集しNode.jsサーバのbase URLを設定してください．
またHTTPSでの接続を推奨します．

    $ cp config/app.json.sample config/app.json
    $ vi config/app.json

### Node.jsサーバの起動

foreverなどを利用し，起動します．
RHELなどの場合，systemctlサービスとして起動することを推奨します．

    $ forever start index.js

## License

CFP summary is available under Apache License version 2.0.

    Copyright 2016 Yuta Hirokawa
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
       http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
