// 読み込むべき写真の枚数
let _imageCount;
// 写真読み込み完了回数
let _imageRead = 0;
// アップロードしたファイルリスト
let _imageFiles = [];
// AwayJSに渡す画像リスト
let _imageList = [];
// ファイルリーダー
let _fileReader;
// 画像の読み込み割合
let _loadingRatio = 0;
let _loadingTimer;

// 案内文
const loadingInfoText = document.getElementById("loadingInfoText");
// ローディングバー
const loadingBar = document.getElementById("loadingBar");
// ファイルアップロードゾーン
const fileZone = document.getElementById("consoleZone");
// ファイルアップロードゾーン中身
const fileZoneInner = document.getElementById("fileZoneInner");
// ドラッグアンドドロップイベント登録
fileZone.addEventListener("dragover", dragEnterHandler);
fileZone.addEventListener("dragleave", dragLeaveHandler);
fileZone.addEventListener("drop", dropHandler);

// input要素。type="file"が設定されている。IDはfileInput。
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", inputChangeHandler);

/** ドラッグオーバー時の処理 */
function dragEnterHandler(event) {
  // デフォルトの挙動を停止
  event.preventDefault();
  fileZoneInner.className = "dragenter";
}

/** ドラッグリーブ時の処理 */
function dragLeaveHandler(event) {
  // デフォルトの挙動を停止
  event.preventDefault();
  fileZoneInner.className = "";
}

/** ファイルをドロップした時の処理 */
function dropHandler(event) {
  // デフォルトの挙動を停止
  event.preventDefault();
  fileZoneInner.className = "";
  fileReadInit(event.dataTransfer.files);
}

/** input内のファイルが変更された時の処理 */
function inputChangeHandler(event) {
  fileReadInit(event.target.files);
}

/** 複数ファイルの読み込みを開始する */
function fileReadInit(files) {
  // ファイルリストを初期化
  _imageFiles = [];
  _imageRead = 0;
  loadingBar.style.width = "0%";
  loadingInfoText.innerText = "";
  const filesLength = files.length;
  for (let i = 0; i < filesLength; i++) {
    const file = files[i];
    // 画像ファイルの時のみ、_imageFilesに格納する。
    if (file.type.match("image.*")) {
      _imageFiles.push(file);
    }
  }
  _imageCount = _imageFiles.length;
  if (_imageCount > 0) {
    // ファイルの読み取り開始
    _fileReader = new FileReader();
    _fileReader.addEventListener("load", (event) => singleFileReadOnLoadHandler(event));
    singleFileReadStartHandler(0);
    _loadingTimer = setInterval(() => {
      loadingTimerHandler();
    }, 30);
  }
}

/** fileIndexで指定されたインデックスのファイル読み込む */
function singleFileReadStartHandler(fileIndex) {
  const file = _imageFiles[fileIndex];
  _fileReader.readAsDataURL(file);
}

/** FileReaderのonloadイベントが発生した時の処理 */
function singleFileReadOnLoadHandler(event) {
  const str = event.target.result;
  // 画像を作成
  const image = new Image();
  image.src = str;
  image.addEventListener("load", (event) => singleFileReadCompleteHandler(image));
}

/** 一つの画像ファイルの読み込みが完了した時の処理 */
function singleFileReadCompleteHandler(image) {
  _imageList.push(image);
  _imageRead++;
  $("#loadedImage").prepend("<figure>" +
    "<img src=\"" + image.src + "\" />" +
    "<figcaption>" + _imageRead + "枚目の画像</figcaption>" +
    "</figure>");
  if (_imageRead >= _imageCount) {
    // 読み込み完了した画像の枚数が、読み込むべき画像の枚数を超えていたら、全画像の読み込み終了処理
    _loadingRatio = 100;
    setTimeout(() => {
      allFilesReadCompleteHandler();
    }, 500);
  }
  else {
    // 次のファイルの読み込み開始
    _loadingRatio = Math.floor((_imageRead / _imageCount) * 100);
    singleFileReadStartHandler(_imageRead);
  }
}

/** ファイル読み込み中に定期的に実行される処理 */
function loadingTimerHandler() {
  const currentLoadingBarRatio = parseFloat(loadingBar.style.width);
  const loadingBarWidth = currentLoadingBarRatio + 0.3 * (_loadingRatio - currentLoadingBarRatio);
  loadingInfoText.innerText = "画像読み込み中:" + String(loadingBarWidth) + "%";
  loadingBar.style.width = loadingBarWidth + "%";
}

/** 全ての画像ファイルの読み込みが完了 */
function allFilesReadCompleteHandler() {
  clearInterval(_loadingTimer);
  if (_loadingTimer)
    _loadingTimer = null;
  loadingInfoText.innerText = "画像読み込み完了";
  loadingBar.style.width = "100%";
  alert("全ファイルの読み込み完了");
}
