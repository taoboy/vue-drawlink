var $ = require("jquery");
var dragResize = require("./dragResize");

var drawRzBox = function (config) {

    if (!(this instanceof drawRzBox)) {
        return new drawRzBox(config).init();
    }

    //配置
    config = $.extend(true, {}, drawRzBox.defaults, config);

    this.config = config;


};

//配置
drawRzBox.defaults = {

    $container: null,
    dragCls: "link-box",
    dragTpl: "",
    dragFn: null,
    resizeFn: null,
    changeFn: null,
    clickFn: null
};

drawRzBox.prototype = {

    DragNum: 0,

    init: function () {

        var that = this;
        var cf = that.config;

        that.list = {};

        that.$container = cf.$container;

        that.setArea();

        that._bindEvent();

        return that;

    },
    _bindEvent: function () {

        var sx = 0;
        var sy = 0;
        var ex = 0;
        var ey = 0;
        var dw = 0;
        var dh = 0;
        var cl = 0;
        var ct = 0;
        var id;
        var $drag;
        var inDraw = false;
        var that = this;
        var area = that.area;
        var list = that.list;
        var cf = that.config;
        var dragCls = cf.dragCls;
        var $container = that.$container;
        var dragTpl = cf.dragTpl;
        var $doc = $(document);
        var created = false;
        var minSize = 10;

        var crateDrag = function () {

            that.DragNum++;


            var cls = id = dragCls + "-" + that.DragNum;

            $drag = $('<div class="' + dragCls + ' active"/>');
            $drag.attr("data-num", that.DragNum);
            $drag.attr("id", id);
            $drag.addClass(cls);
            $drag.html(dragTpl);
            $drag.css({
                "z-index": that.DragNum,
                "width": dw,
                "height": dh,
                "left": cl,
                "top": ct
            });

            $drag.data("class", cls);

            $("." + dragCls).removeClass("active");
            $container.append($drag);
            created = true;

        };


        $(window).bind("resize", function () {
            that.setArea();
        })


        $container.bind("mousedown", function (e) {


            inDraw = true;
            sx = Math.max(e.pageX, area.minX);
            sy = Math.max(e.pageY, area.minY);
            cl = sx - area.minX;
            ct = sy - area.minY;

            //阻止冒泡
            e.stopPropagation();



        })

        $container.bind("mousemove", function (e) {

            if (!inDraw) return;

            ex = e.pageX;
            ey = e.pageY;

            if (ex > area.maxX) ex = area.maxX;
            if (ey > area.maxY) ey = area.maxY;

            dw = ex - sx;
            dh = ey - sy;

            if (!created) {

                if (dw >= minSize && dh >= minSize) {
                    crateDrag();
                }

            }
            else if (dw > 0 && dh > 0) {

                $drag.css({
                    width: dw,
                    height: dh
                })
            }


            return false;

        })

        $doc.bind("mouseup", function (e) {


            if (!inDraw) {

                return;
            }


            if (created) {

                if (dw < minSize || dh < minSize) {

                    that.DragNum--;

                    $drag.remove();

                    that.activeDrag = null;

                } else {
                    that.createDrag($drag);
                }

                dw = dh = 0;
                created = false;
            }

            inDraw = false;

            return false;

        })



    },

    createDrag: function ($drag) {

        var that = this;
        var list = that.list;
        var cf = that.config;
        var $container = that.$container;
        var id = $drag.attr("id");

        var drag = dragResize({

            $drag: $drag,

            $container: $container,

            dragFn: function () {
                cf.dragFn && cf.dragFn.apply(this, arguments);
            },

            changeFn: function () {

                cf.changeFn && cf.changeFn.apply(this, arguments);
            },

            initFn: function () {

                cf.initFn && cf.initFn.apply(this, arguments);
            }
        });

        $drag.bind("click", function () {

            var $that = $(this);
            var id = $that.attr("id");
            var zIndex = $that.css("z-index");
            if (zIndex != that.DragNum) {
                $(this).css("z-index", ++that.DragNum);
                $that.addClass("active").siblings("." + cf.dragCls).removeClass("active");
            }

            that.activeDrag = list[id];
            cf.clickFn && cf.clickFn.call(drag, $drag);
        })


        list[id] = drag;
        that.activeDrag = drag;
        that.list = list;
    },

    createDragList: function ($drags) {
        var that = this;
        $drags.each(function () {
            that.createDrag($(this));
        });
    },

    remove: function () {
        var that = this,
            $container = that.$container;

        $container.off("mousedown").off("mousemove");

    },

    setArea: function () {
        var area = {};
        var $container = this.$container;
        var offset = $container.offset();
        var borderLeftWidth = +$container.css("borderLeftWidth").replace("px", "");
        var borderTopWidth = +$container.css("borderTopWidth").replace("px", "");
        area.left = offset.left;
        area.top = offset.top;
        area.minX = offset.left + borderLeftWidth;
        area.minY = offset.top + borderTopWidth;
        area.maxX = offset.left + $container.width() + borderLeftWidth;
        area.maxY = offset.top + $container.height() + borderTopWidth;


        this.area = area;
    }

};


module.exports = drawRzBox;