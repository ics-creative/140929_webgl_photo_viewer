// ファイルアップロードゾーン
const fileZone = document.getElementById("fileZone");
// ファイルアップロードゾーン中身
const fileZoneInner = document.getElementById("fileZoneInner");
// ドラッグアンドドロップイベント登録
fileZone.addEventListener("dragover", dragEnterHandler);
fileZone.addEventListener("dragleave", dragLeaveHandler);
fileZone.addEventListener("drop", dropHandler);

/** ドラッグオーバー時の処理 */
function dragEnterHandler(event) {
  // デフォルトの挙動を停止
  event.preventDefault();
  fileZoneInner.className = "dragenter";
}

/** ドラッグリーブ時のの処理 */
function dragLeaveHandler(event) {
  // デフォルトの挙動を停止
  event.preventDefault();
  fileZoneInner.className = "";
}

/** ファイルをドロップした時の処理 */
function dropHandler(event) {
  // デフォルトの挙動を停止
  event.preventDefault();
  alert("読み込んだファイルは" + event.dataTransfer.files.toString());
  fileZoneInner.className = "";
}
