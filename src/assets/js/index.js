import $ from "jquery";
import data from "./data";
import dialog from "dialog";
import my from "./my";
import store from "store";
import saveDialog from "../../components/saveDialog.vue";


//方法
var methods = {

    //添加图片
    addImg: function () {

       var imgDialog=  my.addImg({

            dialogName: "addImgDialog",

            title: "添加图片",

            ok: function () {

                var imgurl = window.top.addImgUrl;

                if (imgurl && imgurl != my.data.imgUrl) {

                    my.loadImg(imgurl);
                    my.data.imgUrl = imgurl;
                   
                    my.refreshDialog(imgDialog);
                  
                }
            }
        });
    },

    //新建专题
    newTopic: function () {

        my.clearMain();
        var title = $("title").html();
        var url = window.location.href.split("?")[0];
        history.pushState({ title: title }, title, url);
    },

    //复制专题
    copyTopic: function () {

        var id = my.getParam("id");
        if (!id) return;

        var title = $("title").html();
        var url = window.location.href.split("?")[0];
        history.pushState({ title: title }, title, url);

        
    },

    //缓存加载
    loadByCache: function () {

        my.loadMain(store.get("mainHtml"));
    },

    //清空
    clearMain: function () {
        my.clearMain();
    },

    //预览
    preview: function () {

      
        var html = my.data.codeHtml;

        if (!html) return;
        window.open("preview.html");
    },

    //保存
    saveTopic: function () {
        my.saveTopic();
    },

    //修改链接
    linkChange: function (e) {
        my.setArea(e);
    },

    //修改打开目标
    linkTarget: function (e) {
        my.setArea(e);
    },

    //图片改变
    imgUrlChange: function (e) {

        var $target = $(e.target),
            val = $target.val();
      
    
        var $codebox = my.$codebox;
        if ($codebox && $codebox.length) {
            var $img = $codebox.find("img");
            if ($img.length) {
                $img.attr("src", my.data.imgUrl);
                
            }
        }
    },

    //更换图片
    changeImgUrl: function () {

        var $codebox = my.$codebox;
        if (!$codebox || !$codebox.length) return;

        var imgDialog = my.addImg({
            dialogName:"changeImgDialog",
            title: "更换图片",
            ok: function () {

                var imgurl = window.top.addImgUrl;

              
                if (imgurl && imgurl != my.data.imgUrl) {
                  
                    var $img = $codebox.find("img");
                    if ($img.length) {
                        $img.attr("src", imgurl);
                     
                        my.refreshDialog(imgDialog);
                    }
                }
            }
        });
    },

    //复制代码
    copyCode: function () {

        var code = document.getElementById("codeArea");
        code.select();
        document.execCommand("Copy");
        alert("已复制好，可贴粘。");
    },

    //代码视图
    codeView: function () {

        var id = my.getParam("id");
        var url = "./static/vspen/index.html";
        if (id) {
            url += "?id="+id;
        }

        window.open(url);
    }
};




module.exports = {

    data() {
        return data
    },

    methods: methods,

    watch: {
        imgUrl: function () {
            var $codebox = my.$codebox;
           
            this.disabledChangeImgUrl = this.imgUrl == "" ||
                (!$codebox || !$codebox.length);
        }
    },

    mounted: function () {
        my.init();
    },

    components: {

        saveDialog
    }
};