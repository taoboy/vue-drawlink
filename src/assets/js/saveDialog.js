import $ from "jquery";
import store from "store";
import my from "./my";

var searchTimer;
var inAddCategroy = false;
var data = my.data;
var methods = {

    //选择分类
    selectCatrgory: function (e) {

        var $that = $(e.target),
            id = $that.data("id"),
            categoryList = data.categoryList;
        //$that.addClass("active").siblings().removeClass("active");
        //my.saveActiveCategory(id);
        $.each(categoryList, function () {

            if (this.id == id) {
                this.selected = true;
                my.saveActiveCategory(id);
            }
            else {
                this.selected = false;
            }
           
           
           
        })
        //console.log(2);
    },

    //添加分类
    addCategory: function (e) {

        var $that = $(e.target);
        var val = $that.text();
        if (inAddCategroy || val == "") return;

        inAddCategroy = true;

        my.addTopicCategoryModel({

            title: val

        }, function (d) {

            if (d.status != 1) return;

            var results = d.results;

            if (results && results.length) {
             
                my.data.setAutoCategoryList = $.extend(true, [], results);
                results[0].selected = true;
                my.saveActiveCategory(results[0].id);
                data.categoryList = results;
            }

            inAddCategroy = false;

        });

    },

    //搜索分类
    searchCategory: function (e) {

        if (searchTimer) return;

        var $that = $(e.target),
            val = $that.val(),
            categoryList = data.categoryList;


        searchTimer = setTimeout(function () {

            if (val != "") {

                var likeList = categoryList.filter(function (o) {

                    var tit = o.title.toLowerCase();

                    return val != "" && tit.indexOf(val.toLowerCase()) > -1;
                });

                if (likeList.length) {

                    my.data.newCategory = "";
                    my.data.showAddCategory = false;

                    $.each(likeList, function (i) {
                        this.selected = i == 0;
                    });
                } else {
                    my.data.newCategory = val;
                    my.data.showAddCategory = true;
                }

                my.data.categoryList = likeList;

            } else {

                my.setAutoCategoryList();
                my.data.newCategory = "";
                my.data.showAddCategory = false;

            }

            searchTimer = null;


        }, 10);
    },
};




module.exports = {

    data: data,
    methods: methods

};