// ライブラリを読み込み
/// <reference path="../libs/jquery.d.ts" />
var demo;
(function (demo) {
    var FileUpload = (function () {
        function FileUpload() {
            // 写真読み込み完了回数
            this._imageRead = 0;
            // アップロードしたファイルリスト
            this._imageFiles = [];
            // AwayJSに渡す画像リスト
            this._imageList = [];
            // 画像の読み込み割合
            this._loadingRatio = 0;
            // HTML要素を取得。
            this._loadingInfoText = document.getElementById("loadingInfoText");
            this._loadingBar = document.getElementById("loadingBar");
            this._fileZone = document.getElementById("fileZone");
            this._fileZoneInner = document.getElementById("fileZoneInner");
            this.eventSetting();
        }
        /** 各種イベント設定 */
        FileUpload.prototype.eventSetting = function () {
            var _this = this;
            // ドラッグアンドドロップイベント登録
            this._fileZone.addEventListener("dragover", function (event) {
                return _this.dragEnterHandler(event);
            });
            this._fileZone.addEventListener("dragleave", function (event) {
                return _this.dragLeaveHandler(event);
            });
            this._fileZone.addEventListener("drop", function (event) {
                return _this.dropHandler(event);
            });
            this._fileInput = document.getElementById("fileInput");
            this._fileInput.addEventListener("change", function (event) {
                return _this.inputChangeHandler(event);
            });
        };

        /** ドラッグオーバー時の処理 */
        FileUpload.prototype.dragEnterHandler = function (event) {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "dragenter";
        };

        /** ドラッグリーブ時の処理 */
        FileUpload.prototype.dragLeaveHandler = function (event) {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "";
        };

        /** ファイルをドロップした時の処理 */
        FileUpload.prototype.dropHandler = function (event) {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "";
            this.fileReadInit(event.dataTransfer.files);
        };

        /** input内のファイルが変更された時の処理 */
        FileUpload.prototype.inputChangeHandler = function (event) {
            this.fileReadInit(event.target.files);
        };

        /** 複数ファイルの読み込みを開始する */
        FileUpload.prototype.fileReadInit = function (files) {
            var _this = this;
            // ファイルリストを初期化
            this._imageFiles = [];
            this._imageRead = 0;
            this._loadingBar.style.width = "0%";
            this._loadingInfoText.innerText = "";

            var filesLength = files.length;
            for (var i = 0; i < filesLength; i++) {
                var file = files[i];

                // 画像ファイルの時のみ、_imageFilesに格納する。
                if (file.type.match("image.*")) {
                    this._imageFiles.push(file);
                }
            }
            this._imageCount = this._imageFiles.length;
            if (this._imageCount > 0) {
                // ファイルの読み取り開始
                this._fileReader = new FileReader();
                this._fileReader.addEventListener("load", function (event) {
                    return _this.singleFileReadOnLoadHandler(event);
                });
                this.singleFileReadStartHandler(0);
                var _fileUpload = this;
                this._loadingTimer = setInterval(function () {
                    _fileUpload.loadingTimerHandler();
                }, 30);
            }
        };

        /** fileIndexで指定されたインデックスのファイル読み込む */
        FileUpload.prototype.singleFileReadStartHandler = function (fileIndex) {
            var file = this._imageFiles[fileIndex];
            this._fileReader.readAsDataURL(file);
        };

        /** FileReaderのonloadイベントが発生した時の処理 */
        FileUpload.prototype.singleFileReadOnLoadHandler = function (event) {
            var _this = this;
            var str = event.target.result;

            // 画像を作成
            var image = new Image();
            image.src = str;
            image.addEventListener("load", function (event) {
                return _this.singleFileReadCompleteHandler(image);
            });
        };

        /** 一つの画像ファイルの読み込みが完了した時の処理 */
        FileUpload.prototype.singleFileReadCompleteHandler = function (image) {
            this._imageList.push(image);
            this._imageRead++;
            $("#loadedImage").prepend('<figure>' + '<img src="' + image.src + '" />' + '<figcaption>' + this._imageRead + '枚目の画像</figcaption>' + '</figure>');
            if (this._imageRead >= this._imageCount) {
                // 読み込み完了した画像の枚数が、読み込むべき画像の枚数を超えていたら、全画像の読み込み終了処理
                this._loadingRatio = 100;

                var _fileUpload = this;
                setTimeout(function () {
                    _fileUpload.allFilesReadCompleteHandler();
                }, 500);
            } else {
                // 次のファイルの読み込み開始
                this._loadingRatio = Math.floor((this._imageRead / this._imageCount) * 100);
                this.singleFileReadStartHandler(this._imageRead);
            }
        };

        /** ファイル読み込み中に定期的に実行される処理 */
        FileUpload.prototype.loadingTimerHandler = function () {
            var currentLoadingBarRatio = parseFloat(this._loadingBar.style.width);
            var loadingBarWidth = currentLoadingBarRatio + 0.3 * (this._loadingRatio - currentLoadingBarRatio);
            this._loadingInfoText.innerText = "画像読み込み中:" + String(parseInt(loadingBarWidth)) + "%";
            this._loadingBar.style.width = loadingBarWidth + "%";
        };

        /** 全ての画像ファイルの読み込みが完了 */
        FileUpload.prototype.allFilesReadCompleteHandler = function () {
            clearInterval(this._loadingTimer);
            if (this._loadingTimer)
                this._loadingTimer = null;

            this._loadingInfoText.innerText = "画像読み込み完了";
            this._loadingBar.style.width = "100%";
            alert("全ファイルの読み込み完了");
        };
        return FileUpload;
    })();
    demo.FileUpload = FileUpload;
})(demo || (demo = {}));

window.addEventListener("load", function () {
    new demo.FileUpload();
});
//# sourceMappingURL=step2.js.map
