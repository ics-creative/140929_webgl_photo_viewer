var demo;
(function (demo) {
    var FileUpload = (function () {
        function FileUpload() {
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
        };

        /** ドラッグオーバー時の処理 */
        FileUpload.prototype.dragEnterHandler = function (event) {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "dragenter";
        };

        /** ドラッグリーブ時のの処理 */
        FileUpload.prototype.dragLeaveHandler = function (event) {
            // デフォルトの挙動を停止
            event.preventDefault();
            this._fileZoneInner.className = "";
        };

        /** ファイルをドロップした時の処理 */
        FileUpload.prototype.dropHandler = function (event) {
            // デフォルトの挙動を停止
            event.preventDefault();
            alert("読み込んだファイルは" + event.dataTransfer.files.toString());
            this._fileZoneInner.className = "";
        };
        return FileUpload;
    })();
    demo.FileUpload = FileUpload;
})(demo || (demo = {}));

window.addEventListener("load", function () {
    new demo.FileUpload();
});
//# sourceMappingURL=step1_2.js.map
