<template>
  <div class="upload-one">
    <p>文件上传1.0</p>
    <div ref='drag' id="drag" class="mt20">
      <input type="file" name="file" @change="handleFileChange">
    </div>
    <div class="mt20">
      <el-button @click="uploadFile">上传</el-button>
    </div>
    <div class="mt20">
      <el-progress :stroke-width='20' :text-inside="true" :percentage="hashProgress" ></el-progress>
    </div>
  </div>
</template>

<script>
export default {
   layout:'upload',
  data(){
    return {
      file:null,
      hashProgress:0,
    }
  },
   methods:{
       async uploadFile(){
            const form = new FormData();
            form.append('name','file');
            form.append('file',this.file);
            const ret = await this.$http.post('/uploadFile',form,{
                onUploadProgress:progress=>{
                  // 不是整体的进度条了，而是每个区块有自己的进度条，整体的进度条需要计算
                  console.log(progress);
                  this.hashProgress = Number(((progress.loaded/progress.total)*100).toFixed(2))
                }
              });
            console.log(ret);
       },
       handleFileChange(e){
            const [file] = e.target.files
            if(!file) return 
            this.file = file
       }
   }
}
</script>

<style lang="stylus">
.upload-one
    margin 50px
    .mt20
        margin-top 20px

</style>