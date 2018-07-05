module demo {
    export class FileUpload {
        // 案内文
        private _loadingInfoText:HTMLElement;
        // ファイルアップロードゾーン
        private _fileZone:HTMLElement;
        // ファイルアップロードゾーン中身
        private _fileZoneInner:HTMLElement;

        constructor() {
            this._fileZone = <HTMLElement> document.getElementById("fileZone");
            this._fileZoneInner = document.getElementById("fileZoneInner");
            this.eventSetting();
        }

        /** 各種イベント設定 */
        private eventSetting():void {
            // ドラッグアンドドロップイベント登録
            this._fileZone.addEventListener("dragover", (event:Event) => this.dragEnterHandler(event));
            this._fileZone.addEventListener("dragleave", (event:Event) => this.dragLeaveHandler(event));
            this._fileZone.addEventListener("drop", (event:Event) => this.dropHandler(event));
        }

        /** ドラッグオーバー時の処理 */
        private dragEnterHandler(event:Event):void {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "dragenter";
        }

        /** ドラッグリーブ時のの処理 */
        private dragLeaveHandler(event:Event):void {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "";
        }

        /** ファイルをドロップした時の処理 */
        private dropHandler(event:Event):void {
            // デフォルトの挙動を停止
            event.preventDefault();
            alert("読み込んだファイルは" + event.dataTransfer.files.toString());
            this._fileZoneInner.className = "";
        }
    }
}

window.addEventListener("load", function () {
    new demo.FileUpload();
});
