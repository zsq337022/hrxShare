<template>
  <div class="upload-one">
    <p>文件上传2.0</p>
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
    mounted(){
        this.bindEvents()
    },
    methods:{
        bindEvents(){
            const drag = this.$refs.drag
            drag.addEventListener('dragover',e=>{
                drag.style.borderColor = 'red'
                e.preventDefault()
            })
            drag.addEventListener('dragleave',e=>{
                drag.style.borderColor = '#eee'
                e.preventDefault()
            })
            drag.addEventListener('drop',e=>{
                const fileList = e.dataTransfer.files
                drag.style.borderColor = '#eee'
                this.file = fileList[0]
                console.log(this.file);
                e.preventDefault()
            })
            document.addEventListener('paste',async e=>{
                let items = [],file = null;
                const clipboardData = (e.clipboardData || window.clipboardData || e.originalEvent.clipboardData);
                console.log(clipboardData.getData('files'));
                if (clipboardData.items) {
                    event.preventDefault();
                    items = clipboardData.items;
                    if (items && items.length) {
                        for (var i = 0; i < items.length; i++) {
                            console.log(items[i]);
                            if (items[i].type.indexOf('image') !== -1) {
                                //getAsFile() 此方法只是living standard firefox ie11 并不支持
                                file = items[i].getAsFile();
                                break;
                            }
                        }
                    }
                }
                this.file = file
            })
        }, 
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
#drag
    height 100px
    line-height 100px
    border 2px dashed #eee
    text-align center 
.upload-one
    margin 50px
    .mt20
        margin-top 20px

</style>