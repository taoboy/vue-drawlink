import $ from "jquery";
import noty from "noty";

var my = {};

my.baseUrl = "";

//my.baseUrl = "http://localhost:59459/";

//代码版本
my.codeVersion = 0;



/**
* 获取URL参数
* @return {String} name 参数名称
* @return {string} 返回参数值
*/
my.getParam = function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r) {
        return decodeURI(r[2]);
    }
    return null;
};


/*
*获取一个数据
*/
my.getModel = function (id, callback) {

    if (!id) {
        console && console.log("This id is error.");
    }

    $.ajax({
        url: my.baseUrl +"/Topic/GetModel/" + id,
        type: "GET",
        dataType: "JSON",
        success: function (data) {    
            if ($.isFunction(callback)) {
                callback(data);
            }    
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

            console && console.log(errorThrown);
        }
    })

};


//保存
/**
* 保存model
* @return {object} model 数据对象
* @return {function} 回调函数
*/
my.saveTopicModel = function (datas, callback) {

    if (!datas) return;

    var nt = noty({
        text: "正在保存中...",
        type: "information",
        timeout: 100000
    });

    $.ajax({
        url: my.baseUrl +"/Topic/DoEdit/",
        type: "POST",
        dataType: "JSON",
        data: { datas: JSON.stringify(datas) },

        success: function (data) {

            nt.close();

            if (data.status == 0) {

                noty({
                    text: "保存失败！",
                    type: "error",
                    timeout: 3000
                });

            }
            else if (data.status == 1) {

                noty({
                    text: "保存成功！",
                    type: "success",
                    timeout: 3000
                });
            }

            if ($.isFunction(callback)) {
                callback(data);
            }

        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {

            console && console.log(errorThrown);
        }
    })

};


/*
* 添加专题分类
*/
my.addTopicCategoryModel = function (datas, callback) {

    if (!datas) return;
    var nt;
    var timer = setTimeout(function () {
        timer = null;
        nt = noty({
            text: "正在创建中...",
            type: "information",
            timeout: 100000
        });


    }, 100);

    $.ajax({
        url: my.baseUrl +"/Topic/DoEditCategory/",
        type: "POST",
        dataType: "JSON",
        data: { datas: JSON.stringify(datas) },

        success: function (data) {

            if (timer) {
                clearTimeout(timer);
            } else if (nt) {
                nt.close();
            }


            if (data.status == 0) {

                noty({
                    text: "创建失败！",
                    type: "error",
                    timeout: 3000
                });

            }
            else if (data.status == 1) {

                noty({
                    text: "创建成功！",
                    type: "success",
                    timeout: 3000
                });
            }

            if ($.isFunction(callback)) {
                //console.log(data);
                callback(data);
            }

        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {

            console && console.log(errorThrown);
        }
    })


};


//获取分类列表
my.getCatetoryList = function (callback) {

    $.ajax({
        url: my.baseUrl+"/Topic/GetCategoryList",
        type: "GET",
        dataType: "JSON",


        success: function (data) {


            callback && callback(data);
        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {

            console && console.log(errorThrown);
        }
    })
};



//设置noty

if ($.noty) {
    $.extend(true, $.noty.defaults, {
        type: "alert",
        timeout: 60000,
        custom: $(window.top.document).find('body'),
        layout: "topCenter",
        maxVisible: 5,
        animation: {
            open: {
                height: "toggle"
            },
            close: {
                height: "toggle"
            },
            easing: "swing",
            speed: 200
        }
    })
}



module.exports = my;