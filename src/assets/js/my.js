import $ from "jquery";
import dialog from "dialog";
import store from "store";
import data from "./data";
import my from "./my.core";
import drawRzBox from "./drawRzBox"

//vue 数据
my.data = data;

//清空main内容块
my.clearMain = function () {

    var that = this;

    if (that.drboxs) {
        that.drboxs.remove();
        that.$codebox.remove();
        that.$codebox = null;
        that.$map = null;
        that.drboxs = null;
        my.data.codeHtml = "";
        my.data.linkVal = "";
        my.data.imgUrl = "";

    }


    my.codeVersion = 0;
    that.$main.html("");
    that.$main.css({
        width: "auto",
        height:"auto"
    })
    //window.top.addImgUrl = "";
    store.set("mainHtml", "");
    store.set("codeHtml", "");
    store.set("codeVersion", my.codeVersion);

    //if (my.imgDialog) {

    //    console.log(my.imgDialog.iframe.src);
    //}

};

//创建绘制拖拽区域
my.CreateDrawRzBox = function () {


    var that = this;
    var drboxs = drawRzBox({

        $container: that.$main,

        dragTpl: that.dragTpl,

        changeFn: function () {


            that.addMap(this);
        },

        initFn: function () {

            var drag = this;
            var $map = that.addMap(drag);
            var $drag = drag.$drag;
            var $delete = $(".rz-delete", $drag);
            that.setLink("", "_blank");

            $delete.removeClass("rz-hide").bind("click", function () {
                var id = $(this).parent().attr("id");
                that.deleteArea(id);
            })

        },

        clickFn: function ($drag) {

            var activeDrag = drboxs.activeDrag;

            if (!activeDrag) {
                drboxs.activeDrag = activeDrag = this;
            }

            var $area = activeDrag.$area;
            var href = $area.attr("href");
            var target = $area.attr("target");

            that.setLink(href, target);
            that.setCodeHtml();
        }
    });

    that.drboxs = drboxs;
};

//添加链接热点
my.addMap = function (drag) {

    var $area, coords;
    var that = this;
    var $map = that.$map;
    var $main = that.$main;
    var $codebox = that.$codebox;
    var size = drag.size;
    var $drag = drag.$drag;

    var id = $drag.attr("id");



    coords = size.left + "," + size.top + "," + (size.left + size.width) + "," + (size.top + size.height);


    if ($map == undefined || !$map.length) {

        var name = "linkmap";
        $map = $("<map/>").attr("name", name).attr("id", name);
        $("img", $codebox).attr("usemap", "#" + name);
        $map.append("\n");
        $codebox.append($map);

        that.$map = $map;

    } else {

        $area = $map.find('#' + "area-" + id);
        //drag.$area = $area;
    }

    if ($area == undefined || !$area.length) {

        $area = $('<area shape="rect" target="_blank" ></area>');
        $area.attr("id", "area-" + id);

        $map.append($area);
        $map.append("\n");
        drag.$area = $area;

    }


    $area.attr("coords", coords);


    //that.drboxs.activeDrag = drag;

    that.setCodeHtml();


    return $map;
};


//删除区域
my.deleteArea = function (id) {

    var that = this;
    var drboxs = that.drboxs;
    var $map = drboxs.$map;
    var drag = drboxs.list[id];
    if (!drag) return;

    drag.$area.remove();
    drag.remove();
    delete drboxs.list[id];

    my.setCodeHtml();

};


//设置区域
my.setArea = function (e) {

    var $target = $(e.target);
    var id = $target.attr("id");
    var drboxs = my.drboxs;
    var activeDrag = drboxs.activeDrag;
    if (!activeDrag) return;

    var $area = activeDrag.$area;
    if (id == "linkIpt") {

        $area.attr("href", $target.val());

    } else {

        $area.attr("target", $target[0].checked ? "_blank" : "_self");
    }

    my.setCodeHtml();
};


//保存代码
my.setCodeHtml = function () {

    var $codebox = my.$codebox;
    var $main = my.$main;
    if ($codebox) {
        var $div = $("<div/>");
        $div.html("\n" + $codebox.html() + "\n");

        $div.attr("style", $codebox.attr("style"));
        my.data.codeHtml = $div.prop("outerHTML");
        //my.data.codeHtml = htmlformat(my.data.codeHtml, 1,"\n", 80);
        store.set("mainHtml", $main.prop("outerHTML"));
        store.set("codeHtml", my.data.codeHtml);
        store.set("codeVersion", ++my.codeVersion);

    }
};


//设置链接
my.setLink = function (href, value) {
    var data = my.data;

    data.linkVal = href;
    data.linkTargets = [value];
};


/*
* 加载图片并初始化画布
*/
my.loadImg = function (imgurl) {

    var that = this;
    var $main = my.$main;
    var $img = $("<img/>").css("opacity", 0);
    var $codebox = $('<div class="codebox" id="codebox"></div>');

    that.clearMain();
    $codebox.append("\n");
    $codebox.html($img);
    $codebox.append("\n");
    $main.append($codebox);
    $img.bind("load", function () {

        var $that = $(this);
        var width = $that.width();
        var height = $that.height();

        $codebox.css({
            width: width,
            height: height,
            margin: "0 auto",
            position: "relative"
        })

        $main.css({
            width: width,
            height: height
        }).addClass("active");

        $img.removeAttr("style");

        that.CreateDrawRzBox();

        that.setCodeHtml();



    });
    $img.attr("src", imgurl);

    that.$codebox = $codebox;


};



/*
* 设置默认分类列表
*/
my.setAutoCategoryList = function () {

    var activeId = my.getActiveCategory();
    var list = my.data.autoCategoryList;

    $.each(list, function (i) {
        if (activeId) {
            this.selected = this.id == activeId;
        }
        else if(i==0){
            this.selected = true;
            my.saveActiveCategory(this.id);
        }
    })

    my.data.categoryList = $.extend(true, [],list);
};

/*
* 保存专题
*/
my.saveTopic = function () {

    var activeCategoryId;
    var insubmit = false;
    var id = my.getParam("id");

    my.data.showAddCategory = false;
    my.data.newCategory = "";

    if (!id) {
        my.data.topicTitle = "";
    }

    if (my.saveDialog) {
        my.setAutoCategoryList();
        my.saveDialog.show();
        return;
    }

    my.saveDialog = dialog({

        title: "保存专题",
        content: $("#saveDialog"),
        width: 400,
        height: 400,
        okVal: "保存",
        ok: function () {

            if (insubmit) return ;


            var datas = {},
                $topicTitle = $("#topicTitle"),
                title = $topicTitle.val(),
                $activeItem = $("#categroy-list .active");

            if (title == "") {
                $topicTitle.select();
                return false;
            }

            datas.title = title;
            datas.content = store.get("mainHtml");
            datas.html = my.data.codeHtml;

            if ($activeItem.length) {
             
                datas.categorys = $activeItem.data("id");
                my.saveActiveCategory(datas.categorys);
            }

            if (id) {

                datas.id = id;
            }

            insubmit = true;

            my.saveTopicModel(datas, function (data) {
                insubmit = false;

                my.saveDialog.close();
                if (!datas.id) {
                    setTimeout(function () {
                     
                        //window.location.href += "?id=" + data.results.Id;
                        var title = $("title").html();

                        history.pushState({ title: title}, title, location.href.split("?")[0] + "?id=" + data.results.Id);


                    }, 2000);
                }

            });

            return false;
        },

        close: function () {

            my.saveDialog.hide();

            return false;
        },

        hide: function () {

        },

        init: function () {


            var activeCategoryId = my.getActiveCategory();

            my.data.showSaveDialog = true;


            my.getCatetoryList(function (data) {

                if (data.status != 1) return;

                var activeItem;
                var list = data.results;

                if (!list || !list.length) return;

                my.data.autoCategoryList = $.extend(true, [], list);
            
                if (activeCategoryId) {
                    var list2 = [];

                    $.each(list, function () {

                        if (this.id == activeCategoryId) {
                            activeItem = this;
                            activeItem.selected = true;

                        } else {
                            list2.push(this);
                        }
                    });

                    list = list2;
                } 

                if (activeItem) {
                    list.unshift(activeItem);
                }
                else {
                    list[0].selected = true;
                    my.saveActiveCategory(list[0].id);
                }
                    
                my.data.categoryList = list;
            });

        }

    });

};


//加载main
my.loadMain = function (mainHtml) {

    if (!mainHtml) return;

    var $img;
    var $map;
    var $area;
    var $areas;
    var $drags;
    var $codebox;
    var $activeDrag;
    var maxNum = 1;
    var nums = [];
    var $main = my.$main;
    var $content = my.$content;


    $main.replaceWith(mainHtml);
    $main = my.$main = $("#main");
    $img = $main.find("img");
    $codebox = $main.find(".codebox");
    $drags = $main.find(".link-box");
    $map = $codebox.find("map");
    $areas = $map.find("area");
    $activeDrag = $main.find(".link-box.active");

    $img.bind("load", function () {

        var $that = $(this);
        var list, activeId;

        $main.css({
            width: $that.width(),
            height: $that.height()
        }).addClass("active");

        my.CreateDrawRzBox();
        my.drboxs.createDragList($drags);
        my.setCodeHtml();

        list = my.drboxs.list;

        if ($activeDrag.length) {
            activeId = $activeDrag.attr("id");
        }

        $areas.each(function () {
            var $that = $(this),
                id = $that.attr("id").replace("area-", ""),
                drag = list[id];
            if (id == activeId) {
                my.setLink($that.attr("href"), $that.attr("target"));
            }

            if (drag) {
                drag.$area = $that;
            }
        });

        //缓存 拖拽的编号
        $drags.each(function () {
            var $that = $(this),
                id = $that.attr("id"),
                num = $that.data("num");
            nums.push(num);
        });

        maxNum = Math.max.apply(null, nums);

        my.drboxs.DragNum = maxNum;

    })

    if ($img.length) {
       
        my.data.imgUrl = window.top.addImgUrl = $img.attr("src");
      
    }

    my.$map = $map;
    my.$codebox = $codebox;
};


//预览
my.preview = function (html) {

    //document.getElementById("iframe1").contentDocument.body.innerHTML = html;
    //return;
    if (my.OpenWindow) {
        my.OpenWindow.close();
    }

    var width = 1000;
    var height = 800;
    var left = (window.innerWidth - width) / 2;
    var top = 100;
    var attrs = "height=" + height + ", width=" + width + "," +
        "top=" + top + ", left = " + left + ", toolbar = no, menubar = no";
    my.OpenWindow = window.open("", "newwin", attrs);

    my.OpenWindow.document.write(html)
    my.OpenWindow.document.close();


};


//刷新弹出层
my.refreshDialog = function (d) {
    if (!d) return;
    var $iframe = $(d.iframe);
    $iframe.attr("src", $iframe.attr("src").split("?")[0] + "?v=" + (+new Date()));

};

//添加图片
my.addImg = function (config) {


    config = config || {};

    var dialogName = config.dialogName;
    var imgDialog = my[dialogName];
    
    if (imgDialog) {

        imgDialog.show();

        return;
    }
    else {

    }

    var title = config.title || "添加图片";

    my[dialogName] = imgDialog= dialog({

        title: title,
        content: "url:./static/upload/image/index.html",
        width: 800,
        height: 500,
        ok: function () {

            if (config.ok)
                config.ok();

            imgDialog.hide();

            return false;

        },
        close: function () {

            imgDialog.hide();
        
            return false;
        },
        hide: function () {
           

        },
        lock: true,
        lockOpacity: 0

    });


    return imgDialog;
 
};


//编译分类列表
my.makeHtmlList = function (list) {


var htmls = "";
htmls += template("diTpl", {
    list: list
});

return htmls;
};


//添加分类列表
my.addCategoryList = function (list) {

    var $categoryList = $("#categroy-list");
    var $addCategroy = $("#add-category");

    if (!list || !list.length) {
        $categoryList.html("");
        return;
    }


    $.each(list, function () {
        if (this.selected) {
            this.cls = " active";
            my.saveActiveCategory(this.id);
        }
        else {
            this.cls = "";
        }

    });

    var htmls = my.makeHtmlList(list);

    $categoryList.html(htmls);
    $addCategroy.hide();

  
};


/*
* 保存当前选中分类
*/
my.saveActiveCategory = function (id) {
    store.set("active-category", id);
};

/*
* 获取当前选中分类
*/
my.getActiveCategory = function () {

    return store.get("active-category");
};

/*
* 加载数据
*/
my.loadData = function () {

    var id = my.getParam("id");
    if (id) {

        my.getModel(id, function (data) {
            if (data.status == 1) {
                my.model = data.results;

                if (my.model.categorys) {
                    my.saveActiveCategory(my.model.Categorys);
                }

                my.data.topicTitle = my.model.Title;

                my.loadMain(data.results.Content);
            }

        });

    } else {
        my.loadMain(store.get("mainHtml"));
    }

};

//初始化回调
my.init = function () {

    //my.bindNoty();

    my.dragTpl = $("#drag-reisze-tpl").html();

    my.$content = $("#content");

    my.$main = $("#main");


    my.loadData();
};


module.exports = my;