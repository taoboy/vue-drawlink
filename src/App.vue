<!--<style type="text/css" src="./assets/css/index.css" ></style>-->


<template>

  <div id="app">
    
    
    <div class="header">
      <div class="wrap cf">


        <div class="lmenu fl">
          <button v-on:click="addImg">
            添加图片
          </button>

          <button v-on:click="newTopic">
            新建
          </button>
          
      

          <!--<button v-on:click="loadByCache">
            缓存加载
          </button>-->
          
          <button v-on:click="clearMain">
            清空内容
          </button>
      
          <button v-on:click="copyTopic" >
            复制
          </button>

          <button v-on:click="preview">
            预览
          </button>
          <button v-on:click="saveTopic">
            保存
          </button>
        </div>
        <div class="rmenu fr">
          <a  href="/topic" target="_blank">
            专题列表
          </a>

        </div>

      </div>
    </div>

    <div class="container cf">




      <div class="content" id="content">
        <div id="main" class="main">

        </div>
      </div>


      <div class="sidebar">
        
        <div class="wrap">

          <div class="addLink sbox">
            <div class="li">
              链接<br />
              <input type="text"  class="link-ipt ipt"  v-on:propertychange="linkChange" v-on:input="linkChange"   id="linkIpt"  v-model="linkVal"/>
            </div>
            <div class="li">
              是否新标签打开:<input type="checkbox" v-on:click="linkTarget" value="_blank"  v-model="linkTargets" id="linkTarget"/>
            </div>
          </div>


          <div class="bgImg sbox">
            <div class="li">

              <div class="ipt-tit">
                图片地址 &nbsp;&nbsp;<a href="javascript:;" class="link-upload" v-bind:class="{disabled:disabledChangeImgUrl}" v-on:click="changeImgUrl"  >更换图片</a>
              </div>
                
              <div class="ipt-box">
                <input type="text"  class="imgurl-ipt ipt"  v-on:propertychange="imgUrlChange" v-on:input="imgUrlChange"   id="imgUrlIpt"  v-model="imgUrl"/>

              </div>

            </div>

          </div>

          <div class="codeLink  sbox">
            <h3>
              生成代码
            </h3>
            <textarea id="codeArea" class="codeArea" v-model="codeHtml"></textarea>

            <div class="ipt-ac">
             <button v-on:click="copyCode" >复制代码</button><button v-on:click="codeView">代码视图</button>
            </div>
          </div>

        </div>
        
      </div>


    </div>

    
    
    <script type="text/template" id="drag-reisze-tpl">
      <a class="rz-delete rz-hide" href="javascript:void(0);" title="删除" >×</a>
      <div class="resize-box">
        <div class="rz rz-se"></div>
        <div class="rz rz-s"></div>
        <div class="rz rz-sw"></div>
        <div class="rz rz-w"></div>
        <div class="rz rz-nw"></div>
        <div class="rz rz-n"></div>
        <div class="rz rz-ne"></div>
        <div class="rz rz-e"></div>
      </div>

    </script>

    <saveDialog></saveDialog>

  </div>

  
  
</template>




<script>

  import index from "./assets/js/index";

  export default  index


</script>


