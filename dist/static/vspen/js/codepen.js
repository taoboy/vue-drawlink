var fl = fl || {};

/**
 * 获取URL参数
 * @return {String} name 参数名称
 * @return {string} 返回参数值
 */
fl.getParam = function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r) {
        return decodeURI(r[2]);
    }
    return null;
};


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

    cf.navs.unbind().bind("click", function () {
        var $that = $(this),
            index = $that.index();

        if ($.isFunction(fn)) {
            if (!fn.call($that, index))
                return false;
        }

        $that.addClass(cls).siblings().removeClass(cls);
        cf.cts.eq(index).addClass(cls).siblings().removeClass(cls);

    });

    if(cf.startIndex>0){
        cf.navs.eq(cf.startIndex).trigger("click");
    }

    if ($.isFunction(cf.initFn)) {
        cf.initFn();
    }


};

/*
*运行代码
*/
fl.doRun = function (data) {

    var runContainer = document.getElementById("output");
    var runIframe = fl.runIframe;

    if (runIframe) {
       
        runContainer.removeChild(runIframe);
    }

    window.top["editorData"] = data;


    // Load new iframe
    runIframe = document.createElement('iframe');
    runIframe.id = 'runIframe';
    runIframe.src = 'run.html';
    runIframe.className = 'run-iframe';
    runIframe.style.boxSizing = 'border-box';
    runIframe.style.width = '100%';
    runIframe.frameborder = '0';
    runContainer.appendChild(runIframe);

    fl.runIframe = runIframe;

};

/*
*运行代码
*/
fl.doRun2 = function (pageUrl) {

    var runContainer = document.getElementById("code-result");
    var runIframe = fl.runIframe;

    if (runIframe) {
       
        runContainer.removeChild(runIframe);
    }

    // Load new iframe
    runIframe = document.createElement('iframe');
    runIframe.id = 'runIframe';
    runIframe.src = pageUrl;
    runIframe.className = 'run-iframe';
    runIframe.style.boxSizing = 'border-box';
    runIframe.style.width = '100%';
    runIframe.frameborder = '0';
    runContainer.appendChild(runIframe);

    fl.runIframe = runIframe;

};


/*
*获取一个数据
*/
fl.getModel = function (id,callBack) {


    if (!id) {

        console && console.log("id is error");
    }


    $.ajax({
        url: "/Topic/GetModel/"+id,
        type: "GET",
        dataType: "JSON",
        success: function (data) {

            if (data.status && $.isFunction(callBack)) {
            
                callBack(data.results);
            }
      
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

            console && console.log(errorThrown);
        }

    })

};


/*
*加载数据
*/
fl.loadData = function () {

    //获取参数
    var id = fl.getParam("id");

    if (!id) {

        var html = store.get("codeHtml");
        if (html != "") {
            fl.doRun2("../preview.html");
           
            var str = Prism.highlight(html, Prism.languages["html"])
            $("#codehtml").html(html);
            $("#code-html").html(str);
        }
        return;
    }

    fl.getModel(id, function (d) {

        var data = {
            css: d.Css,
            html: d.Html,
            javascript: d.Js
        }

        $("title").html(d.Title);
        $("#codehtml").val(data.html);

        fl.model = data;
    
        fl.doRun2("/html/vs/" + d.PageName + ".html");

        for (var o in data) {
            str = Prism.highlight(data[o], Prism.languages[o]);
            $("#code-" + o).html(str);
        }


    })
};



fl.init = function () {

    $(function () {

        var $codeContainer = $("#code-container");
        var $output = $("#output");
        var $codeMenu = $("#code-menu");
        var $navs = $("li", $codeMenu);
        var $cts = $(".code-box", $output );
        var $result = $(".result",$codeMenu);

        var actCls = "active";
        var splitCls = "split-output";
        var singleCls = "signle-output";
        var penCls = store.get("penCls");

        var savePenCls = function () {
            var penCls2 = {};
            var navsCls = [];
            var ctsCls = [];

            $navs.each(function () {

                navsCls.push($(this).hasClass(actCls) ? actCls : "");
            });

            $cts.each(function () {

                ctsCls.push($(this).hasClass(actCls) ? actCls : "");
            });

            penCls2.navsCls = navsCls;
            penCls2.ctsCls = ctsCls;
            penCls2.outputCls = "code-boxs ";
            penCls2.outputCls += $output.hasClass(splitCls) ? splitCls : singleCls;

            store.set("penCls", penCls2);
        };

        var setPenClsByStore = function () {
           
            if (!penCls) return;
        
            var navsCls = penCls.navsCls;
            var ctsCls = penCls.ctsCls;
            var outputCls = penCls.outputCls;

            $navs.each(function (i) {
                var $that = $(this);
                var cls = navsCls[i];
                if (cls) {
                    $that.addClass(cls);
                }
                else {
                    if ($that.hasClass(actCls)) {
                        $that.removeClass(actCls);
                    }
                }
            });

            $cts.each(function (i) {
                var $that = $(this);
                var cls = ctsCls[i];
                if (cls) {
                    $that.addClass(cls);
                }
                else {
                    if ($that.hasClass(actCls)) {
                        $that.removeClass(actCls);
                    }
                }
            });
          
            $output.attr("class", outputCls);
        };



        var setContainerHeight = function () {

            var h = fl.getParam("h");
            if (h) {
                $codeContainer.height(h);
            }
        };

        $navs.bind("click", function () {

            var $that = $(this),
                index = $that.index(),
                $ct = $cts.eq(index),
                oneActive = $("li.active", $codeMenu).length==1,
                hasActive = $that.hasClass(actCls),
                resultActive = $result.hasClass(actCls),
                isResult = $that.hasClass("result");
       

            if (resultActive) {

                if (isResult) {
                    if (!oneActive) {
                        $that.removeClass(actCls);
                        $output.removeClass(splitCls).addClass(singleCls);
                    }

                }
                else {

                    if (hasActive) {
                        $that.removeClass(actCls);
                        $ct.removeClass(actCls);
                        $output.removeClass(splitCls).addClass(singleCls);
                    }
                    else {
                        //console.log(1);
                        $that.addClass(actCls).siblings().not(".result").removeClass(actCls);
                        $ct.addClass(actCls).siblings().not(".result-box").removeClass(actCls);
                        $output.addClass(splitCls).removeClass(singleCls);

                    }

                }
            }
            else {

                $that.addClass(actCls);
                $ct.addClass(actCls);

                if (isResult) {
                    $output.addClass(splitCls).removeClass(singleCls);
                }
                else {
                    $that.siblings().removeClass(actCls);
                    $ct.siblings().removeClass(actCls);
                }
            }

            savePenCls();
        });

        $("#copyHtml").bind("click", function () {
        
            var code = document.getElementById("codehtml");
             code.select(); 
             document.execCommand("Copy");
             alert("已复制好，可贴粘。");
        })

        setPenClsByStore();
        setContainerHeight();
        fl.loadData();

       


   
    })


    

};


fl.init();