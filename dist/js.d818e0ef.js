// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/js/index.js":[function(require,module,exports) {
var SONGLRC = ""; // 歌词

generateAudio(); // 将代码挂载到DOM上

initAudioEvent(); //初始化音频控制事件

function initAudioEvent() {
  var audio = document.getElementById('music-real-audio'); // 点击播放/暂停图片时，控制音乐的播放与暂停

  document.getElementById('audioPlayer').onclick = function () {
    // 监听音频播放时间并更新进度条
    audio.addEventListener('timeupdate', function () {
      updateProgress(audio);
    }, false); // 监听播放完成事件

    audio.addEventListener('ended', function () {
      audioEnded();
    }, false); // 改变播放/暂停图片

    var avatar_wrapper = document.getElementsByClassName('avatar-wrapper');

    if (audio.paused) {
      // 开始播放当前点击的音频
      audio.play();
      document.getElementById("audioPlayer").className = "iconfont icon-pause avatar";

      for (var i = 0; i < avatar_wrapper.length; i++) {
        avatar_wrapper[i].style.animationPlayState = "running";
      }

      document.getElementById("audioPlayer").style.animationPlayState = "running";
    } else {
      audio.pause();
      document.getElementById("audioPlayer").className = "iconfont icon-play avatar";

      for (var i = 0; i < avatar_wrapper.length; i++) {
        avatar_wrapper[i].style.animationPlayState = "paused";
      }

      document.getElementById("audioPlayer").style.animationPlayState = "paused";
    }
  }; // 点击进度条跳到指定点播放


  document.getElementById('progressBarBg').onmousedown = function (e) {
    // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
    if (!audio.paused || audio.currentTime != 0) {
      var pgsWidth = document.getElementsByClassName('progress-bar-bg')[0].clientWidth;
      var rate = e.offsetX / pgsWidth;
      audio.currentTime = audio.duration * rate;
      updateProgress(audio);
    }
  };

  getTotalTime(audio);
  dragProgressDotEvent(audio);
}
/**
 * 鼠标拖动进度点时可以调节进度
 * @param {*} audio 
 */


function dragProgressDotEvent(audio) {
  var dot = document.getElementById('progressDot');
  var position = {
    oriOffestLeft: 0,
    // 移动开始时进度条的点距离进度条的偏移值
    oriX: 0,
    // 移动开始时的x坐标
    maxLeft: 0,
    // 向左最大可拖动距离
    maxRight: 0 // 向右最大可拖动距离

  };
  var flag = false; // 标记是否拖动开始
  // 鼠标按下时

  dot.addEventListener('mousedown', down, false);
  dot.addEventListener('touchstart', down, false); // 开始拖动

  document.addEventListener('mousemove', move, false);
  document.addEventListener('touchmove', move, false); // 拖动结束

  document.addEventListener('mouseup', end, false);
  document.addEventListener('touchend', end, false);

  function down(event) {
    if (!audio.paused || audio.currentTime != 0) {
      // 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
      flag = true;
      position.oriOffestLeft = dot.offsetLeft;
      position.oriX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousedown和touchstart事件

      position.maxLeft = position.oriOffestLeft; // 向左最大可拖动距离

      position.maxRight = document.getElementById('progressBarBg').offsetWidth - position.oriOffestLeft; // 向右最大可拖动距离
      // 禁止默认事件（避免鼠标拖拽进度点的时候选中文字）

      if (event && event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      } // 禁止事件冒泡


      if (event && event.stopPropagation) {
        event.stopPropagation();
      } else {
        window.event.cancelBubble = true;
      }
    }
  }

  function move(event) {
    if (flag) {
      var clientX = event.touches ? event.touches[0].clientX : event.clientX; // 要同时适配mousemove和touchmove事件

      var length = clientX - position.oriX;

      if (length > position.maxRight) {
        length = position.maxRight;
      } else if (length < -position.maxLeft) {
        length = -position.maxLeft;
      }

      var pgsWidth = document.getElementsByClassName('progress-bar-bg')[0].clientWidth;
      var rate = (position.oriOffestLeft + length) / pgsWidth;
      audio.currentTime = audio.duration * rate;
      updateProgress(audio);
    }
  }

  function end() {
    flag = false;
  }
}
/**
 * 更新进度条与当前播放时间
 * @param {object} audio - audio对象
 */


function updateProgress(audio) {
  var value = audio.currentTime / audio.duration;
  document.getElementById("progressBar").style.width = 'width', value * 100 + '%';
  document.getElementById("progressDot").style.left = value * 100 + '%';
  document.getElementById('audioCurTime').innerText = transTime(audio.currentTime);
  setLrc(audio);
}
/**
 * 播放完成时把进度调回开始的位置
 */


function audioEnded() {
  document.getElementById("progressBar").style.width = '0';
  document.getElementById("progressDot").style.left = '0';
  document.getElementById('audioCurTime').innerText = transTime(0);
  document.getElementById("audioPlayer").className = "iconfont icon-play avatar";
}
/**
 * 音频播放时间换算
 * @param {number} value - 音频当前播放时间，单位秒
 */


function transTime(value) {
  var time = "";
  var h = parseInt(value / 3600);
  value %= 3600;
  var m = parseInt(value / 60);
  var s = parseInt(value % 60);

  if (h > 0) {
    time = formatTime(h + ":" + m + ":" + s);
  } else {
    time = formatTime(m + ":" + s);
  }

  return time;
}
/**
 * 格式化时间显示，补零对齐
 * eg：2:4  -->  02:04
 * @param {string} value - 形如 h:m:s 的字符串 
 */


function formatTime(value) {
  var time = "";
  var s = value.split(':');
  var i = 0;

  for (; i < s.length - 1; i++) {
    time += s[i].length == 1 ? "0" + s[i] : s[i];
    time += ":";
  }

  time += s[i].length == 1 ? "0" + s[i] : s[i];
  return time;
}
/**
 * 获取音频总时间
 */


function getTotalTime(audio) {
  if (audio === null) {
    document.getElementById('audioTotalTime').innerText = transTime(0);
  } else {
    audio.load();

    audio.oncanplay = function () {
      document.getElementById('audioTotalTime').innerText = transTime(audio.duration);
    };
  }
}
/**
 * 将代码挂载到DOM上
 */


function generateAudio() {
  var html = "\n    <div id=\"music-wrapper\">\n        <link rel=\"stylesheet\" type=\"text/css\" href=\"/html5-musicplayer/index.css\">\n        <div id=\"music-avatar\">\n            <div id=\"avatar-bgimg\"></div>\n            <div class=\"avatar-wrapper\">\n                <img class=\"avatar\" id=\"song-avatar\" src=\"\" alt=\"avatar\" class=\"avatar\">\n            </div>\n            <div class=\"avatar-wrapper\">\n                <span class=\"iconfont icon-play avatar\" id=\"audioPlayer\" ></span>\n            </div>\n        </div>\n\n        <div id=\"music-info-wrapper\">\n            <div id=\"music-info\">\n                <div id=\"music-baseinfo\">\n                    <span id=\"music-title\"></span>\n                    <span id=\"music-author\"></span>\n                </div>\n                <div id=\"music-lrc\">\n                </div>\n            </div>\n            <!-- <div id=\"music-author\"></div> -->\n\n            <div id=\"music-controller\">\n                <audio id=\"music-real-audio\" src=\"\">Your browser does not support it!</audio>\n                <div class=\"progress-bar-bg\" id=\"progressBarBg\">\n                    <span id=\"progressDot\"></span>\n                    <div class=\"progress-bar\" id=\"progressBar\"></div>\n                </div>\n                <div class=\"audio-time\">\n                    <span class=\"audio-length-current\" id=\"audioCurTime\">00:00</span>\n                    <span class=\"audio-length-total\" id=\"audioTotalTime\">00:00</span>\n                </div>\n            </div>\n        </div>\n    </div>\n    <div id=\"music-wrapper-bg\"></div>\n    <iframe hidden=\"true\" id=\"for-getsonglrc\" name=\"for-getsonglrc\" src=\"\"></iframe>\n    ";
  var musicplayer = document.getElementById('html5-musicplayer');
  musicplayer.innerHTML = html; //将代码挂载到DOM上

  var songSrc = musicplayer.getAttribute('song-src');
  var songAuthor = musicplayer.getAttribute('song-author');
  var songTitle = musicplayer.getAttribute('song-title');
  var songAvatar = musicplayer.getAttribute('song-avatar');
  var songLrc = musicplayer.getAttribute('song-lrc');
  SONGLRC = getFormatLrc(songLrc); //get song lrc

  document.getElementsByClassName('avatar')[0].setAttribute("src", songAvatar);
  document.getElementById('music-real-audio').setAttribute("src", songSrc);
  document.getElementById('music-title').innerText = songTitle;
  document.getElementById('music-author').innerText = songAuthor;
  var realplayer = document.getElementById('music-wrapper');
  var realplayerwidth = realplayer.clientWidth > 500 ? 510 : realplayer.clientWidth * 0.9 + 10;
  var realplayerheight = realplayer.clientHeight + 20;
  var playbg = document.getElementById('music-wrapper-bg');
  playbg.style.width = realplayerwidth + 'px'; // playbg.style.height = realplayerheight + 'px';

  playbg.style.height = 100 + 'px';
  playbg.style.background = 'url(' + songAvatar + ') no-repeat center';
  playbg.style.backgroundSize = 'cover';
  playbg.style.backgroundPosition = 'center center';
  document.getElementById("music-info-wrapper").style.width = realplayerwidth - 120 + 'px';
  document.getElementById("progressBarBg").style.width = realplayerwidth - 120 + 'px';

  if (strlen(songTitle) > 14) {
    document.getElementById('music-title').style.animationPlayState = "running";
  }

  if (strlen(songAuthor) > 14) {
    document.getElementById('music-author').style.animationPlayState = "running";
  }
}

function getFormatLrc(lrc) {
  var reg = /\[\d+:\d+.\d+\]/g;
  var i = 0;
  var lrcwords = lrc.split(reg);
  var lrctime = lrc.match(reg);
  lrctime.unshift('[00:00.000]');
  var result = {};
  lrcwords.map(function (item, index) {
    var index_m = lrctime[index].indexOf(':');
    var index_s = lrctime[index].indexOf('.');
    var result_key = parseInt(lrctime[index].slice(1, index_m)) * 60 + parseInt(lrctime[index].slice(index_m + 1, index_s)) + parseFloat(lrctime[index].slice(index_s + 1, lrctime[index].length - 1) / 1000) + '';
    item = item.replace('\\n', '');
    result[result_key] = item !== '' ? item : '······';
  });
  return result;
}

function setLrc(audio) {
  var currentTime = audio.currentTime;
  var realtime = '0';
  var i;

  for (i in SONGLRC) {
    if (parseFloat(i) < parseFloat(currentTime)) {
      if (parseFloat(realtime) < parseFloat(i)) realtime = i;
    }
  }

  document.getElementById('music-lrc').innerText = SONGLRC[realtime];
}

function strlen(str) {
  var len = 0;

  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i); //单字节加1 

    if (c >= 0x0001 && c <= 0x007e || 0xff60 <= c && c <= 0xff9f) {
      len++;
    } else {
      len += 2;
    }
  }

  return len;
}
},{}],"C:/Users/a2289/AppData/Local/Yarn/Data/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59365" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/a2289/AppData/Local/Yarn/Data/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/js/index.js"], null)
//# sourceMappingURL=/js.d818e0ef.js.map