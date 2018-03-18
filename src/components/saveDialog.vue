<template>

  <div id="saveDialog" class="saveDialog"  v-bind:class="{show:showSaveDialog}">


    <div class="form-item">
      <input type="text" class="form-control" placeholder="标题"  id="topicTitle" v-model="topicTitle"/>
    </div>

    <div class="form-item">
      <input type="text" class="form-control" placeholder="搜索或创建分类" id="topicCategory" v-on:propertychange="searchCategory" v-on:input="searchCategory"/>
    </div>

    <div class="form-item">
      <div class="add-category" id="add-category" v-bind:class="{show:showAddCategory}">
        创建分类：<strong id="new-category" v-on:click="addCategory">{{newCategory}}</strong>
      </div>
      <div class="category-list" id="categroy-list">
        <div class="di" v-for="item in categoryList" :data-id="item.id" v-bind:class="{active: item.selected}" v-on:click="selectCatrgory">
                  {{item.title}}
        </div>
      </div>

    </div>


  </div>

</template>



<script>

  import saveDialog from "../assets/js/saveDialog";

  export default {

  data() {
  return saveDialog.data;
  },

  methods:saveDialog.methods

  }

</script>