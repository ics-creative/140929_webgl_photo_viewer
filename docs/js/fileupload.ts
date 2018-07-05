/// <reference path="main.ts" />

module demo {
    export class FileUpload {
        // Mainクラスのインスタンス
        private _main:demo.Main;
        // 案内文
        private _loadingInfoText:HTMLElement;
        // input要素。type="file"が設定されている。IDはfileInput。
        private _fileInput:HTMLInputElement;
        // 読み込むべき写真の枚数
        private _imageCount:number;
        // 写真読み込み完了回数
        private _imageRead:number = 0;
        // アップロードしたファイルリスト
        private _imageFiles:File[] = [];
        // AwayJSに渡す画像リスト
        private _imageList:HTMLImageElement[] = [];
        // ファイルリーダー
        private _fileReader:FileReader;
        // ファイルアップロードゾーン
        private _fileZone:HTMLElement;
        // ファイルアップロードゾーン中身
        private _fileZoneInner:HTMLElement;
        // ローディングバー
        private _loadingBar:HTMLElement;
        // 画像の読み込み割合
        private _loadingRatio:number = 0;
        // 画像の短辺サイズ
        private CARD_WIDTH:number = 512;
        private _loadingTimer:number;

        constructor() {
            // HTML要素を取得。
            this._loadingInfoText = document.getElementById("loadingInfoText");
            this._loadingBar = document.getElementById("loadingBar");
            this._fileZone = <HTMLElement> document.getElementById("fileZone");
            this._fileZoneInner = document.getElementById("fileZoneInner");

            // AwayJS側の処理実行
            this._main = new demo.Main();

            this.eventSetting();
        }

        /** 各種イベント設定 */
        private eventSetting():void {
            // ドラッグアンドドロップイベント登録
            this._fileZone.addEventListener("dragover", (event:Event) => this.dragEnterHandler(event));
            this._fileZone.addEventListener("dragleave", (event:Event) => this.dragLeaveHandler(event));
            this._fileZone.addEventListener("drop", (event:Event) => this.dropHandler(event));
            this._fileZone.addEventListener("click", (event:MouseEvent) => this.clickHandler(event));
            this._fileInput = <HTMLInputElement> document.getElementById("fileInput");
            this._fileInput.addEventListener("change", (event:Event)=> this.inputChangeHandler(event));
        }

        /** id="fileZone"のクリック時の処理 */
        private clickHandler(event:MouseEvent):void {
            // ファイルアップロードの場面の場合は、inputによるファイルアップロード処理
            if (isFileUploadScene) {
                // fileInputのClickのイベントを強制的に発火させる
                var clickEvent:MouseEvent = new MouseEvent("click");
                this._fileInput.dispatchEvent(clickEvent);

                if(isMainBuild)
                {
                    this._fileZone.className = "off";
                    isFileUploadScene = false;
                }
            }
            else
            {
                this._loadingBar.style.width = "0%";
                this._loadingInfoText.innerText = "";

                this._fileZone.className = "";
                // ファイルアップロードシーンに切り替え
                isFileUploadScene = true;
            }
        }

        /** ドラッグオーバー時の処理 */
        private dragEnterHandler(event:Event):void {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "dragenter";
        }

        /** ドラッグリーブ時の処理 */
        private dragLeaveHandler(event:Event):void {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "";
        }

        /** ファイルをドロップした時の処理 */
        private dropHandler(event:Event):void {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "";
            this.fileReadInit(event.dataTransfer.files);
        }

        /** input内のファイルが変更された時の処理 */
        private inputChangeHandler(event:Event):void {
            this.fileReadInit(event.target.files)
        }



        /** 複数ファイルの読み込みを開始する */
        private fileReadInit(files:FileList):void {
            // ファイルリストを初期化
            this._imageFiles = [];
            this._imageRead = 0;
            this._loadingBar.style.width = "0%";
            this._loadingInfoText.innerText = "";

            var filesLength:number = files.length;
            for (var i:number = 0; i < filesLength; i++) {
                var file:File = files[i];
                // 画像ファイルの時のみ、_imageFilesに格納する。
                if (file.type.match("image.*")) {
                    this._imageFiles.push(file);
                }
            }
            this._imageCount = this._imageFiles.length;
            if (this._imageCount > 0) {
                // ファイルの読み取り開始
                this._fileReader = new FileReader();
                this._fileReader.addEventListener("load", (event:Event) => this.singleFileReadOnLoadHandler(event));
                this.singleFileReadStartHandler(0);
                var _fileUpload:FileUpload = this;
                this._loadingTimer = setInterval(function ():void {
                    _fileUpload.loadingTimerHandler();
                }, 30);
            }
            else {
                this._fileZone.className = "off";
                // レンダリングシーンに切り替え
                isFileUploadScene = false;
            }
        }

        /** fileIndexで指定されたインデックスのファイル読み込む */
        private singleFileReadStartHandler(fileIndex:number):void {
            var file:File = this._imageFiles[fileIndex];
            this._fileReader.readAsDataURL(file);
        }

        /** FileReaderのonloadイベントが発生した時の処理 */
        private singleFileReadOnLoadHandler(event):void {
            var str:string = event.target.result;
            // 画像を作成
            var image:HTMLImageElement = <HTMLImageElement> new Image();
            image.src = str;
            image.addEventListener("load", (event:Event) => this.singleFileReadCompleteHandler(image));
        }

        /** 一つの画像ファイルの読み込みが完了した時の処理 */
        private singleFileReadCompleteHandler(image:HTMLImageElement):void {
            // 画像を縮小
            var resizedImage:HTMLImageElement = this.resizeImage(image);
            this._imageList.push(resizedImage);
            this._imageRead++;

            if (this._imageRead >= this._imageCount) {
                // 読み込み完了した画像の枚数が、読み込むべき画像の枚数を超えていたら、全画像の読み込み終了処理
                this._loadingRatio = 100;

                var _fileUpload:FileUpload = this;
                setTimeout(function ():void {

                    _fileUpload.allFilesReadCompleteHandler();
                }, 500);
            }
            else {
                // 次のファイルの読み込み開始
                this._loadingRatio = Math.floor((this._imageRead / this._imageCount) * 100);
                this.singleFileReadStartHandler(this._imageRead);
            }
        }

        /** 画像の短辺をCARD_WIDTHにして比率を保ったまま縮小する */
        private resizeImage(image:HTMLImageElement):HTMLImageElement {
            var canvas:HTMLCanvasElement = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var newImageWidth:number;
            var newImageHeight:number;
            if (image.naturalWidth >= image.naturalHeight) {
                newImageWidth = (this.CARD_WIDTH / image.naturalHeight) * image.naturalWidth;
                newImageHeight = this.CARD_WIDTH;
            }
            else {
                newImageWidth = this.CARD_WIDTH;
                newImageHeight = (this.CARD_WIDTH / image.naturalWidth) * image.naturalHeight;
            }

            canvas.width = newImageWidth;
            canvas.height = newImageHeight;
            ctx.drawImage(image, 0, 0, newImageWidth, newImageHeight);

            var newImage:HTMLImageElement = <HTMLImageElement> new Image();
            newImage.src = canvas.toDataURL();
            return newImage;
        }

        /** ファイル読み込み中に定期的に実行される処理 */
        private loadingTimerHandler():void {
            var currentLoadingBarRatio:number = parseFloat(this._loadingBar.style.width);
            var loadingBarWidth:number = currentLoadingBarRatio + 0.3 * (this._loadingRatio - currentLoadingBarRatio);
            this._loadingInfoText.innerText = "画像読み込み中:" + String(parseInt(loadingBarWidth)) + "%";
            this._loadingBar.style.width = loadingBarWidth + "%";
        }

        /** 全ての画像ファイルの読み込みが完了 */
        private allFilesReadCompleteHandler():void {
            clearInterval(this._loadingTimer);
            if (this._loadingTimer)
                this._loadingTimer = null;

            this._main.init(this._imageList);

        }
    }
}

window.addEventListener("load", function () {
    new demo.FileUpload();
});
