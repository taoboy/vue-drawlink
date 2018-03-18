var $ = require("jquery");

var dragResize = function (config) {

    if (!(this instanceof dragResize)) {
        return new dragResize(config).init();
    }

    //配置
    config = $.extend(true, {}, dragResize.defaults, config);

    this.config = config;


};

dragResize.defaults = {


    //拖动的对象 jquery 对象
    $drag: null,

    //在哪个容器内拖动 jquery 对象
    $container: null,

    //是否锁定
    lock: false,

    //是否锁定水平方向拖放
    lockX: false,

    //是否锁定垂直方向拖放
    lockY: false,

    //拖拽过程中的回调函数
    dragFn: null,

    //调整大小回调函数
    resizeFn: null,

    //改变尺寸回调函数
    changeFn: null,

    //初始化后回调函数
    initFn: null
};

dragResize.prototype = {


    //初始化
    init: function () {

        var cf = this.config;

        if (!cf.$drag || cf.$drag.length < 1) {

            return;
        }

        if (!cf.$container ||
            !cf.$container.length) {
            cf.$container = $(document);
        }

        //设置内置对象
        this.lock = cf.lock;
        this.lockX = cf.lockX;
        this.lockY = cf.lockY;
        this.size = {};

        this.$drag = cf.$drag;
        this.$container = cf.$container;

        this._bindEvent();
        this.setSize();

        cf.initFn && cf.initFn.call(this, this.$drag);

        return this;
    },


    //绑定事件
    _bindEvent: function () {

        var that = this,
            cf = that.config,
            $doc = $(document),
            $drag = that.$drag,
            $container = that.$container,
            inDrag,
            sx, sy,
            dx, dy,
            dw, dh,
            isActive,
            inResize,
            offset,
            area,
            size,
            $rz,
            rz = {
                e: false,
                se: false,
                s: false,
                sw: false,
                w: false,
                nw: false,
                n: false,
                ne: false
            };

        var isResize = function (d) {
            return $rz.hasClass("rz" + (d == "rz" ? "" : "-" + d));
        };

        that.setArea();
        area = that.area;

        $drag.bind("mousedown", function (e) {

            that.setSize();
            size = $.extend({}, that.size);

            isActive = true;
            $rz = $(e.target);
            offset = $drag.offset();
            sx = e.pageX;
            sy = e.pageY;
            dx = offset.left;
            dy = offset.top;
            dw = size.width;
            dh = size.height;

            //调整大小
            if (isResize("rz")) {

                //进行调整
                inResize = true;
                inDrag = false;

                for (var o in rz) {
                    isResize(o) && (rz[o] = true);
                }
            }
            else {
                //拖拽
                inDrag = true;
            }

            //阻止冒泡
            e.stopPropagation();

        })


        $doc.bind("mousemove", function (e) {

            if (!isActive) return;

            var maxWidth, maxHeight, maxLeft, maxTop,
                css = {},
                ex = e.pageX,
                ey = e.pageY,
                lockX = that.lockX,
                lockY = that.lockY;


            //进行拖拽
            if (inDrag && !that.lock) {

                if ((!lockY && lockX) || (!lockX && !lockY)) {

                    css.top = size.top + (ey - sy);
                }

                if ((!lockX && lockY) || (!lockX && !lockY)) {

                    css.left = size.left + (ex - sx);
                }

                if (css.left) {

                    css.left = Math.max(0, css.left);
                    css.left = Math.min(css.left, area.width - dw);
                }

                if (css.top) {

                    css.top = Math.max(0, css.top);
                    css.top = Math.min(css.top, area.height - dh);
                }


            }

            //进行调整
            if (inResize) {

                //东 east
                if (rz.e) {
                    css.width = dw + (ex - sx);

                }

                //南东 sourth east
                else if (rz.se) {
                    css = {
                        width: dw + (ex - sx),
                        height: dh + (ey - sy)
                    }
                }

                //南 sourth
                else if (rz.s) {
                    css.height = dh + (ey - sy);
                }

                //南西 sourth  west
                else if (rz.sw) {
                    css = {
                        width: dw - (ex - sx),
                        height: dh + (ey - sy),
                        left: size.left + (ex - sx)
                    }
                }
                //西 west
                else if (rz.w) {
                    css = {
                        width: dw - (ex - sx),
                        left: size.left + (ex - sx)
                    }
                }
                //北西 north west
                else if (rz.nw) {
                    css = {
                        width: dw - (ex - sx),
                        height: dh - (ey - sy),
                        left: size.left + (ex - sx),
                        top: size.top + (ey - sy)
                    }
                }
                //北 north
                else if (rz.n) {
                    css = {
                        height: dh - (ey - sy),
                        top: size.top + (ey - sy)
                    }
                }
                //北东 north east
                else if (rz.ne) {
                    css = {
                        width: dw + (ex - sx),
                        height: dh - (ey - sy),
                        top: size.top + (ey - sy)
                    }
                }

                if (css.width) {

                    if (rz.e || rz.se || rz.ne) {
                        maxWidth = area.width - size.left;
                    }

                    if (rz.w || rz.sw || rz.nw) {
                        maxWidth = area.width - size.right;
                        maxLeft = maxWidth;
                    }

                    css.width = Math.min(maxWidth, css.width);
                    css.width = Math.max(0, css.width);

                }


                if (css.height) {

                    if (rz.s || rz.se || rz.sw) {
                        maxHeight = area.height - size.top;
                    }

                    if (rz.n || rz.nw || rz.ne) {
                        maxHeight = area.height - size.bottom;
                        maxTop = maxHeight;
                    }

                    css.height = Math.min(maxHeight, css.height);
                    css.height = Math.max(0, css.height);
                }



                if (css.top) {
                    css.top = Math.min(maxTop, css.top);
                    css.top = Math.max(0, css.top);
                }

                if (css.left) {
                    css.left = Math.min(maxLeft, css.left);
                    css.left = Math.max(0, css.left);
                }

            }

            $drag.css(css);

            $.extend(that.size, css);

            if (inDrag) {
                //回调函数
                cf.dragFn && cf.dragFn.call(that, $drag);
            }

            if (inResize) {
                //回调函数
                cf.resizeFn && cf.resizeFn.call(that, $drag);
            }

            //改变后回调函数
            cf.changeFn && cf.changeFn.call(that, $drag);

            return false;
        })


        $doc.bind("mouseup", function (e) {

            isActive = false;

            if (inDrag) {
                inDrag = false;
            }

            if (inResize) {

                inResize = false;

                for (var o in rz) {
                    rz[o] = false;
                }
            }

            return false;
        })
    },


    //设置尺寸
    setSize: function () {
        var w, h, l, t, r, b,
            that = this,
            area = that.area,
            $drag = that.$drag;

        w = parseInt($drag.css("width"));
        h = parseInt($drag.css("height"));
        l = parseInt($drag.css("left"));
        t = parseInt($drag.css("top"));
        b = area.height - t - h;
        r = area.width - l - w;

        $.extend(that.size, {

            width: w,
            height: h,
            left: l,
            right: r,
            top: t,
            bottom: b

        })

    },

    //设置拖拽区域
    setArea: function () {
        var area = {};
        var areaLeft = 0;
        var areaTop = 0;
        var borderLeftWidth = 0;
        var borderTopWidth = 0;
        var $container = this.$container;
        var offset = $container.offset();

        if ($container[0].nodeType == 1) {

            borderLeftWidth = parseInt($container.css("borderLeftWidth"));
            borderTopWidth = parseInt($container.css("borderTopWidth"));
        }

        if (offset) {
            areaLeft = offset.left;
            areaTop = offset.top;
        }

        area.left = areaLeft;
        area.top = areaTop;
        area.height = $container.height();
        area.width = $container.width();
        area.minX = areaLeft + borderLeftWidth;
        area.minY = areaTop + borderTopWidth;
        area.maxX = areaLeft + area.width + borderLeftWidth;
        area.maxY = areaTop + area.height + borderTopWidth;

        this.area = area;
    },

    //清除锁定
    clearLock: function () {

        this.lock = false;
        this.lockX = false;
        this.lockY = false;
    },

    //移除
    remove: function () {

        var that = this;
        var $drag = that.$drag;
        $drag.off("mousedown");
        $drag.remove();
    }
};

module.exports = dragResize;