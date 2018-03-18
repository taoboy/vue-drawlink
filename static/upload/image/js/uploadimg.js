
var baseUrl = window.location.origin;
//baseUrl = "http://localhost:59459/";

/* 上传图片 */
function UploadImage(target) {
    this.$wrap = target.constructor == String ? $('#' + target) : $(target);
    this.init();
}

UploadImage.config = {

    acceptExtensions: "png,jpg,jpeg,gif,bmp",
    getImgUrl: baseUrl + "/cdn/common/ueditor/net/controller.ashx?action=listimage2",
    actionUrl: baseUrl + "/cdn/common/ueditor/net/controller.ashx?action=uploadimage2",
    imageCompressBorder: 1600,
    imageMaxSize: 4048000,
    uploadBtnText: "上传图片",
    imageFieldName: "upfile",
    imageCompressEnable: true

};

UploadImage.lang = {
    'uploadSelectFile': '点击选择图片',
    'uploadAddFile': '继续添加',
    'uploadStart': '开始上传',
    'uploadPause': '暂停上传',
    'uploadContinue': '继续上传',
    'uploadRetry': '重试上传',
    'uploadDelete': '删除',
    'uploadTurnLeft': '向左旋转',
    'uploadTurnRight': '向右旋转',
    'uploadPreview': '预览中',
    'uploadNoPreview': '不能预览',
    'updateStatusReady': '选中_张图片，共_KB。',
    'updateStatusConfirm': '已成功上传_张照片，_张照片上传失败',
    'updateStatusFinish': '共_张（_KB），_张上传成功',
    'updateStatusError': '，_张上传失败。',
    'errorNotSupport': 'WebUploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器。',
    'errorLoadConfig': '后端配置项没有正常加载，上传插件不能正常使用！',
    'errorExceedSize': '文件大小超出',
    'errorFileType': '文件格式不允许',
    'errorInterrupt': '文件传输中断',
    'errorUploadRetry': '上传失败，请重试',
    'errorHttp': 'http请求错误',
    'errorServerUpload': '服务器返回出错',
    'remoteLockError': "宽高不正确,不能所定比例",
    'numError': "请输入正确的长度或者宽度值！例如：123，400",
    'imageUrlError': "不允许的图片格式或者图片域！",
    'imageLoadError': "图片加载失败！请检查链接地址或网络状态！",
    'searchRemind': "请输入搜索关键词",
    'searchLoading': "图片加载中，请稍后……"
};
UploadImage.prototype = {
    init: function () {
        this.imageList = [];
        this.initContainer();
        this.initUploader();
    },
    initContainer: function () {
        this.$queue = this.$wrap.find('.filelist');
    },
    /* 初始化容器 */
    initUploader: function () {

        var _this = this,
            $ = jQuery,    // just in case. Make sure it's not an other libaray.
            $wrap = _this.$wrap,
        // 图片容器
            $queue = $wrap.find('.filelist'),
        // 状态栏，包括进度和控制按钮
            $statusBar = $wrap.find('.statusBar'),
        // 文件总体选择信息。
            $info = $statusBar.find('.info'),
        // 上传按钮
            $upload = $wrap.find('.uploadBtn'),
        // 上传按钮
            $filePickerBtn = $wrap.find('.filePickerBtn'),
        // 上传按钮
            $filePickerBlock = $wrap.find('.filePickerBlock'),
        // 没选择文件之前的内容。
            $placeHolder = $wrap.find('.placeholder'),
        // 总体进度条
            $progress = $statusBar.find('.progress').hide(),
        // 添加的文件数量
            fileCount = 0,
        // 添加的文件总大小
            fileSize = 0,
        // 优化retina, 在retina下这个值是2
            ratio = window.devicePixelRatio || 1,
        // 缩略图大小
            thumbnailWidth = 113 * ratio,
            thumbnailHeight = 113 * ratio,
        // 可能有pedding, ready, uploading, confirm, done.
            state = '',
        // 所有文件的进度信息，key为file id
            percentages = {},
            supportTransition = (function () {
                var s = document.createElement('p').style,
                    r = 'transition' in s ||
                        'WebkitTransition' in s ||
                        'MozTransition' in s ||
                        'msTransition' in s ||
                        'OTransition' in s;
                s = null;
                return r;
            })(),
        // WebUploader实例

        cf=UploadImage.config,
        uploader,
        actionUrl = cf.actionUrl,
        acceptExtensions = cf.acceptExtensions,
        imageMaxSize = cf.imageMaxSize ,
        imageCompressBorder = cf.imageCompressBorder;

        uploader = _this.uploader = WebUploader.create({
            pick: {
                id: '#filePickerReady',
                label: cf.uploadBtnText
            },
            accept: {
                title: 'Images',
                extensions: acceptExtensions,
                mimeTypes: 'image/*'
            },
            swf: '../../third-party/webuploader/Uploader.swf',
            fileNumLimit: 1,
            server: actionUrl,
            fileVal: cf.imageFieldName,
            duplicate: true,
            fileSingleSizeLimit: imageMaxSize,    // 默认 2 M
            compress: cf.imageCompressEnable ? {
                width: imageCompressBorder,
                height: imageCompressBorder,
                // 图片质量，只有type为`image/jpeg`的时候才有效。
                quality: 90,
                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                allowMagnify: false,
                // 是否允许裁剪。
                crop: false,
                // 是否保留头部meta信息。
                preserveHeaders: true
            } : false
        });


        var lang = UploadImage.lang;

        uploader.addButton({
            id: '#filePickerBlock'
        });
        uploader.addButton({
            id: '#filePickerBtn',
            label: lang.uploadAddFile
        });

        setState('pedding');

        //当有文件添加进来时执行，负责view的创建
        function addFile(file) {
            var $li = $('<li id="' + file.id + '">' +
                    '<p class="title">' + file.name + '</p>' +
                    '<p class="imgWrap"></p>' +
                    '<p class="progress"><span></span></p>' +
                    '</li>'),

                $btns = $('<div class="file-panel">' +
                    '<span class="cancel">' + lang.uploadDelete + '</span>' +
                    '<span class="rotateRight">' + lang.uploadTurnRight + '</span>' +
                    '<span class="rotateLeft">' + lang.uploadTurnLeft + '</span></div>').appendTo($li),
                $prgress = $li.find('p.progress span'),
                $wrap = $li.find('p.imgWrap'),
                $info = $('<p class="error"></p>').hide().appendTo($li),

                showError = function (code) {
                    switch (code) {
                        case 'exceed_size':
                            text = lang.errorExceedSize;
                            break;
                        case 'interrupt':
                            text = lang.errorInterrupt;
                            break;
                        case 'http':
                            text = lang.errorHttp;
                            break;
                        case 'not_allow_type':
                            text = lang.errorFileType;
                            break;
                        default:
                            text = lang.errorUploadRetry;
                            break;
                    }
                    $info.text(text).show();
                };

            if (file.getStatus() === 'invalid') {
                showError(file.statusText);
            } else {
                $wrap.text(lang.uploadPreview);
                if (browser.ie && browser.version <= 7) {
                    $wrap.text(lang.uploadNoPreview);
                } else {
                    uploader.makeThumb(file, function (error, src) {
                        if (error || !src) {
                            $wrap.text(lang.uploadNoPreview);
                        } else {
                            var $img = $('<img src="' + src + '">');
                            $wrap.empty().append($img);
                            $img.on('error', function () {
                                $wrap.text(lang.uploadNoPreview);
                            });
                        }
                    }, thumbnailWidth, thumbnailHeight);
                }
                percentages[file.id] = [file.size, 0];
                file.rotation = 0;

                /* 检查文件格式 */
                if (!file.ext || acceptExtensions.indexOf(file.ext.toLowerCase()) == -1) {
                    showError('not_allow_type');
                    uploader.removeFile(file);
                }
            }

            file.on('statuschange', function (cur, prev) {
                if (prev === 'progress') {
                    $prgress.hide().width(0);
                } else if (prev === 'queued') {
                    $li.off('mouseenter mouseleave');
                    $btns.remove();
                }
                // 成功
                if (cur === 'error' || cur === 'invalid') {
                    showError(file.statusText);
                    percentages[file.id][1] = 1;
                } else if (cur === 'interrupt') {
                    showError('interrupt');
                } else if (cur === 'queued') {
                    percentages[file.id][1] = 0;
                } else if (cur === 'progress') {
                    $info.hide();
                    $prgress.css('display', 'block');
                } else if (cur === 'complete') {
                }

                $li.removeClass('state-' + prev).addClass('state-' + cur);
            });

            $li.on('mouseenter', function () {
                $btns.stop().animate({ height: 30 });
            });
            $li.on('mouseleave', function () {
                $btns.stop().animate({ height: 0 });
            });

            $btns.on('click', 'span', function () {
                var index = $(this).index(),
                    deg;

                switch (index) {
                    case 0:
                        uploader.removeFile(file);
                        return;
                    case 1:
                        file.rotation += 90;
                        break;
                    case 2:
                        file.rotation -= 90;
                        break;
                }

                if (supportTransition) {
                    deg = 'rotate(' + file.rotation + 'deg)';
                    $wrap.css({
                        '-webkit-transform': deg,
                        '-mos-transform': deg,
                        '-o-transform': deg,
                        'transform': deg
                    });
                } else {
                    $wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((file.rotation / 90) % 4 + 4) % 4) + ')');
                }

            });

            $li.insertBefore($filePickerBlock);
        }

        // 负责view的销毁
        function removeFile(file) {
            var $li = $('#' + file.id);
            delete percentages[file.id];
            updateTotalProgress();
            $li.off().find('.file-panel').off().end().remove();
        }

        function updateTotalProgress() {
            var loaded = 0,
                total = 0,
                spans = $progress.children(),
                percent;

            $.each(percentages, function (k, v) {
                total += v[0];
                loaded += v[0] * v[1];
            });

            percent = total ? loaded / total : 0;

            spans.eq(0).text(Math.round(percent * 100) + '%');
            spans.eq(1).css('width', Math.round(percent * 100) + '%');
            updateStatus();
        }

        function setState(val, files) {

            if (val != state) {

                var stats = uploader.getStats();

                $upload.removeClass('state-' + state);
                $upload.addClass('state-' + val);

                switch (val) {

                    /* 未选择文件 */
                    case 'pedding':
                        $queue.addClass('element-invisible');
                        $statusBar.addClass('element-invisible');
                        $placeHolder.removeClass('element-invisible');
                        $progress.hide(); $info.hide();
                        uploader.refresh();
                        break;

                        /* 可以开始上传 */
                    case 'ready':
                        $placeHolder.addClass('element-invisible');
                        $queue.removeClass('element-invisible');
                        $statusBar.removeClass('element-invisible');
                        $progress.hide(); $info.show();
                        $upload.text(lang.uploadStart);
                        uploader.refresh();
                        break;

                        /* 上传中 */
                    case 'uploading':
                        $progress.show(); $info.hide();
                        $upload.text(lang.uploadPause);
                        break;

                        /* 暂停上传 */
                    case 'paused':
                        $progress.show(); $info.hide();
                        $upload.text(lang.uploadContinue);
                        break;

                    case 'confirm':
                        $progress.show(); $info.hide();
                        $upload.text(lang.uploadStart);

                        stats = uploader.getStats();
                        if (stats.successNum && !stats.uploadFailNum) {
                            setState('finish');
                            return;
                        }
                        break;

                    case 'finish':
                        $progress.hide(); $info.show();
                        if (stats.uploadFailNum) {
                            $upload.text(lang.uploadRetry);
                        } else {
                            $upload.text(lang.uploadStart);
                        }
                        break;
                }

                state = val;
                updateStatus();

            }

            if (!_this.getQueueCount()) {
                $upload.addClass('disabled')
            } else {
                $upload.removeClass('disabled')
            }

        }

        function updateStatus() {
            var text = '', stats;

            if (state === 'ready') {
                text = lang.updateStatusReady.replace('_', fileCount).replace('_KB', WebUploader.formatSize(fileSize));
            } else if (state === 'confirm') {
                stats = uploader.getStats();
                if (stats.uploadFailNum) {
                    text = lang.updateStatusConfirm.replace('_', stats.successNum).replace('_', stats.successNum);
                }
            } else {
                stats = uploader.getStats();
                text = lang.updateStatusFinish.replace('_', fileCount).
                    replace('_KB', WebUploader.formatSize(fileSize)).
                    replace('_', stats.successNum);

                if (stats.uploadFailNum) {
                    text += lang.updateStatusError.replace('_', stats.uploadFailNum);
                }
            }

            $info.html(text);
        }

        uploader.on('fileQueued', function (file) {
            fileCount++;
            fileSize += file.size;

            if (fileCount === 1) {
                $placeHolder.addClass('element-invisible');
                $statusBar.show();
            }

            addFile(file);
        });

        uploader.on('fileDequeued', function (file) {
            fileCount--;
            fileSize -= file.size;

            removeFile(file);
            updateTotalProgress();
        });

        uploader.on('filesQueued', function (file) {
            if (!uploader.isInProgress() && (state == 'pedding' || state == 'finish' || state == 'confirm' || state == 'ready')) {
                setState('ready');
            }
            updateTotalProgress();
        });

        uploader.on('all', function (type, files) {
            switch (type) {
                case 'uploadFinished':
                    setState('confirm', files);
                    break;
                case 'startUpload':
                    /* 添加额外的GET参数 */
                    var params = "",//utils.serializeParam(editor.queryCommandValue('serverparam')) || '',
                        url = utils.formatUrl(actionUrl + (actionUrl.indexOf('?') == -1 ? '?' : '&') + 'encode=utf-8&' + params);
                    uploader.option('server', url);
                    setState('uploading', files);
                    break;
                case 'stopUpload':
                    setState('paused', files);
                    break;
            }
        });

        uploader.on('uploadBeforeSend', function (file, data, header) {
            //这里可以通过data对象添加POST参数
            header['X_Requested_With'] = 'XMLHttpRequest';
        });

        uploader.on('uploadProgress', function (file, percentage) {
            var $li = $('#' + file.id),
                $percent = $li.find('.progress span');

            $percent.css('width', percentage * 100 + '%');
            percentages[file.id][1] = percentage;
            updateTotalProgress();
        });

        uploader.on('uploadSuccess', function (file, ret) {
            var $file = $('#' + file.id);
            try {
                var responseText = (ret._raw || ret),
                    json = utils.str2json(responseText);
                if (json.state == 'SUCCESS') {
                    _this.imageList.push(json);
                    $file.append('<span class="success"></span>');

                    //console.log(baseUrl);

                    if (baseUrl.indexOf(".") > -1) {
                        json.url = baseUrl + json.url;
                    }

                    window.top.addImgUrl = json.url;

                    $("#imgUrl").val(json.url);
          
                } else {
                    $file.find('.error').text(json.state).show();
                }
            } catch (e) {
                $file.find('.error').text(lang.errorServerUpload).show();
            }
        });

        uploader.on('uploadError', function (file, code) {

        });

        uploader.on('error', function (code, file) {
            if (code == 'Q_TYPE_DENIED' || code == 'F_EXCEED_SIZE') {
                addFile(file);
            }
        });
        uploader.on('uploadComplete', function (file, ret) {
       
        });

        $upload.on('click', function () {
            if ($(this).hasClass('disabled')) {
                return false;
            }

            if (state === 'ready') {
                uploader.upload();
            } else if (state === 'paused') {
                uploader.upload();
            } else if (state === 'uploading') {
                uploader.stop();
            }
        });

        $upload.addClass('state-' + state);
        updateTotalProgress();
    },
    getQueueCount: function () {
        var file, i, status, readyFile = 0, files = this.uploader.getFiles();
        for (i = 0; file = files[i++];) {
            status = file.getStatus();
            if (status == 'queued' || status == 'uploading' || status == 'progress') readyFile++;
        }
        return readyFile;
    },
    destroy: function () {
        this.$wrap.remove();
    },
    getInsertList: function () {
        var i, data, list = [],
            align = getAlign(),
            prefix = "";
        for (i = 0; i < this.imageList.length; i++) {
            data = this.imageList[i];
            list.push({
                src: prefix + data.url,
                _src: prefix + data.url,
                title: data.title,
                alt: data.original,
                floatStyle: align
            });
        }
        return list;
    }
};



var fl = fl || {};

/*
* Tab 模块切换
*/
fl.bindTab = function (cf) {

    cf = $.extend({
        navs:null,
        cts:null,
        activeCls:"active",
        startIndex:0,
        clickFn: null,
        initFn:null

    }, cf);

    var fn = cf.clickFn,
        cls = cf.activeCls || "active";

    cf.navs.on("click", function () {
        var $that = $(this),
            index = $that.index();

        $that.addClass(cls).siblings().removeClass(cls);
        cf.cts.eq(index).addClass(cls).siblings().removeClass(cls);

        if ($.isFunction(fn)) {
            if (!fn.call($that, index))
                return false;
        }
    });

    if(cf.startIndex>0){
        cf.navs.eq(cf.startIndex).trigger("click");
    }

    if ($.isFunction(cf.initFn)) {
        cf.initFn();
    }


};

var domUtils = {};

domUtils.addClass = function (ele, cls) {
    $(ele).addClass(cls)
};

domUtils.removeClass = function (ele, cls) {
    $(ele).removeClass(cls)
};

domUtils.hasClass = function (ele, cls) {
    return $(ele).hasClass(cls)
};

domUtils.on = function (ele,event, fn) {
  $(ele).bind(event,fn)

};


var $G = function (id) {
    return document.getElementById(id);
};

    /* 在线图片 */
    function OnlineImage(target) {
        this.container = utils.isString(target) ? document.getElementById(target) : target;
        this.init();
    }
    OnlineImage.prototype = {
        init: function () {
            this.reset();
            this.initEvents();
        },
        /* 初始化容器 */
        initContainer: function () {
            this.container.innerHTML = '';
            this.list = document.createElement('ul');
            this.clearFloat = document.createElement('li');

            domUtils.addClass(this.list, 'list');
            domUtils.addClass(this.clearFloat, 'clearFloat');

            this.list.appendChild(this.clearFloat);
            this.container.appendChild(this.list);
        },
        /* 初始化滚动事件,滚动到地步自动拉取数据 */
        initEvents: function () {
            var _this = this;

            /* 滚动拉取图片 */
            domUtils.on($G('imageList'), 'scroll', function(e){
                var panel = this;
                if (panel.scrollHeight - (panel.offsetHeight + panel.scrollTop) < 10) {
                    _this.getImageData();
                }
            });
            /* 选中图片 */
            domUtils.on(this.container, 'click', function (e) {
                var target = e.target || e.srcElement,
                    li = target.parentNode;

                if (li.tagName.toLowerCase() == 'li') {
                    if (domUtils.hasClass(li, 'selected')) {
                        domUtils.removeClass(li, 'selected');
                    } else {
                        var $li = $(li);
                       $li.addClass("selected").siblings().removeClass("selected")
                       window.top.addImgUrl = $li.find("img").attr("src");
                   
                    }
                }
            });
        },


        /* 初始化第一次的数据 */
        initData: function () {

            /* 拉取数据需要使用的值 */
            this.state = 0;
            this.listSize =20;
            this.listIndex = 0;
            this.listEnd = false;

            /* 第一次拉取数据 */
            this.getImageData();
        },


        /* 重置界面 */
        reset: function() {
            this.initContainer();
            this.initData();
        },


        /* 向后台拉取图片列表数据 */
        getImageData: function () {
            var _this = this;

            if(!_this.listEnd && !this.isLoadingData) {
                this.isLoadingData = true;
            

                var url = UploadImage.config.getImgUrl ;

                $.ajax({
                    url: url,
                    type: "GET",
                    'data': utils.extend({
                        start: this.listIndex,
                        size: this.listSize
                    }, {}),
                    success: function (r) {

                           try {
                            var json = eval('(' + r + ')');
                            if (json.state == 'SUCCESS') {
                                _this.pushData(json.list);
                                _this.listIndex = parseInt(json.start) + parseInt(json.list.length);
                                if(_this.listIndex >= json.total) {
                                    _this.listEnd = true;
                                }
                                _this.isLoadingData = false;
                            }
                        } catch (e) {
                            if(r.indexOf('ue_separate_ue') != -1) {
                                var list = r;
                                _this.pushData(list);
                                _this.listIndex = parseInt(list.length);
                                _this.listEnd = true;
                                _this.isLoadingData = false;
                            }
                        }
                    },
                    error: function (d) {
                         _this.isLoadingData = false;
                    }

                })




            }
        },


        /* 添加图片到列表界面上 */
        pushData: function (list) {
            var i, item, img, icon, _this = this;
            for (i = 0; i < list.length; i++) {
                if(list[i] && list[i].url) {
                    item = document.createElement('li');
                    img = document.createElement('img');
                    icon = document.createElement('span');

                    domUtils.on(img, 'load', (function(image){
                        return function(){
                            _this.scale(image, image.parentNode.offsetWidth, image.parentNode.offsetHeight);
                        }
                    })(img));
                    img.width = 113;
                    img.setAttribute('src', baseUrl + list[i].url + (list[i].url.indexOf('?') == -1 ? '?noCache=':'&noCache=') + (+new Date()).toString(36) );
                    img.setAttribute('_src', baseUrl+ list[i].url);
                    domUtils.addClass(icon, 'icon');

                    item.appendChild(img);
                    item.appendChild(icon);
                    this.list.insertBefore(item, this.clearFloat);
                }
            }
        },


        /* 改变图片大小 */
        scale: function (img, w, h, type) {
            var ow = img.width,
                oh = img.height;

            if (type == 'justify') {
                if (ow >= oh) {
                    img.width = w;
                    img.height = h * oh / ow;
                    img.style.marginLeft = '-' + parseInt((img.width - w) / 2) + 'px';
                } else {
                    img.width = w * ow / oh;
                    img.height = h;
                    img.style.marginTop = '-' + parseInt((img.height - h) / 2) + 'px';
                }
            } else {
                if (ow >= oh) {
                    img.width = h * ow / oh;
                    img.height = h;
                    img.style.marginLeft = '-' + parseInt((img.width - w) / 2) + 'px';
                } else {
                    img.width = w;
                    img.height = w * oh / ow;
                    img.style.marginTop = '-' + parseInt((img.height - h) / 2) + 'px';

                }
            }
        },


        getInsertList: function () {
            var i, lis = this.list.children, list = [], align = getAlign();
            for (i = 0; i < lis.length; i++) {
                if (domUtils.hasClass(lis[i], 'selected')) {
                    var img = lis[i].firstChild,
                        src = img.getAttribute('_src');
                    list.push({
                        src: src,
                        _src: src,
                        alt: src.substr(src.lastIndexOf('/') + 1),
                        floatStyle: align
                    });
                }

            }
            return list;
        }
    };



fl.init = function () {
    
var imgUpload = new UploadImage("queueList");

fl.bindTab({

    navs: $("#tab-menu li"),
    cts: $("#tab-cts .tab-ct"),
    clickFn: function () {
        var $that = $(this);


         fl.onlineImage = fl.onlineImage || new OnlineImage('imageList');
        // fl.onlineImage.reset();
    }
});


$("#imgUrl").bind("propertychange input", function () {

    window.top.addImgUrl = $(this).val();
 
})

if (window.top.addImgUrl) {

    $("#imgUrl").val(window.top.addImgUrl);
}

    window.top.addImgUrl = $("#imgUrl").val();
};

fl.init();

