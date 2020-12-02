<template>
  <div class="upload-one">
    <p>文件上传4.0 文件切片上传</p>
    <div class="mt20">
      <input type="text" />
    </div>
    <div ref="drag" id="drag" class="mt20">
      <input type="file" name="file" @change="handleFileChange" />
    </div>
    <div class="mt20">
      <el-button @click="uploadFileChunks">上传</el-button>
    </div>
    <div class="mt20">
      <el-progress
        :stroke-width="20"
        :text-inside="true"
        :percentage="hashProgress"
      ></el-progress>
    </div>
  </div>
</template>

<script>
import md5 from "md5";
const CHUNK_SIZE = 0.01 * 1024 * 1024;
export default {
  layout: "upload",
  data() {
    return {
      file: null,
      hashProgress: 0,
    };
  },
  mounted() {
    this.bindEvents();
  },
  methods: {
    bindEvents() {
      const drag = this.$refs.drag;
      drag.addEventListener("dragover", (e) => {
        drag.style.borderColor = "red";
        e.preventDefault();
      });
      drag.addEventListener("dragleave", (e) => {
        drag.style.borderColor = "#eee";
        e.preventDefault();
      });
      drag.addEventListener("drop", (e) => {
        const fileList = e.dataTransfer.files;
        drag.style.borderColor = "#eee";
        this.file = fileList[0];
        console.log(this.file);
        e.preventDefault();
      });
      document.addEventListener("paste", async (e) => {
        let items = [],
          file = null;
        const clipboardData =
          e.clipboardData ||
          window.clipboardData ||
          e.originalEvent.clipboardData;
        console.log(clipboardData.getData("files"));
        if (clipboardData.items) {
          event.preventDefault();
          items = clipboardData.items;
          if (items && items.length) {
            for (var i = 0; i < items.length; i++) {
              console.log(items[i]);
              if (items[i].type.indexOf("image") !== -1) {
                //getAsFile() 此方法只是living standard firefox ie11 并不支持
                file = items[i].getAsFile();
                break;
              }
            }
          }
        }
        this.file = file;
      });
    },
    createFileChunk(file, size = CHUNK_SIZE, hash) {
      const chunks = [];
      const chunksStatus = [];
      let cur = 0;
      let index = 0;
      while (cur < this.file.size) {
        chunks.push({ index: index, file: this.file.slice(cur, cur + size) });
        chunksStatus.push({ index: index, name: hash, progress: 0 });
        cur += size;
        index++;
      }
      this.chunks = chunksStatus;
      return chunks;
    },
    async uploadFileChunks() {
      if (!this.file) return;
      const fileName = md5(this.file.name);
      const chunks = this.createFileChunk(this.file, CHUNK_SIZE, fileName);
      const requests = chunks.map((chunk) => {
        return new Promise(async (resolve, reject) => {
          const form = new FormData();
          console.log(chunk);
          form.append("hash", fileName);
          form.append("file", chunk.file);
          form.append("name", fileName + "-" + chunk.index);
          const ret = await this.$http.post("/uploadFileChunks", form, {
            onUploadProgress: (progress) => {
              // 不是整体的进度条了，而是每个区块有自己的进度条，整体的进度条需要计算
              this.chunks[chunk.index].progress = Number(
                ((progress.loaded / progress.total) * 100).toFixed(2)
              );
            },
          });
          if (ret.code == 0) {
            resolve(ret);
          } else {
            reject(ret);
          }
        });
      });
      await Promise.all(requests);
      const ret = await this.$http.post('/mergefile',{
        ext:this.file.name.split('.').pop(),
        size:CHUNK_SIZE,
        hash:fileName
      })

    },
    async uploadFile() {
      console.log(this.file, md5(this.file.name));
      console.log(this.createFileChunk(this.file));
      return;
      const form = new FormData();
      form.append("name", "file");
      form.append("file", this.file);
      const ret = await this.$http.post("/uploadFile", form, {
        onUploadProgress: (progress) => {
          // 不是整体的进度条了，而是每个区块有自己的进度条，整体的进度条需要计算
          console.log(progress);
          this.hashProgress = Number(
            ((progress.loaded / progress.total) * 100).toFixed(2)
          );
        },
      });
      console.log(ret);
    },
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      this.file = file;
    },
  },
};
</script>

<style lang="stylus">
#drag {
  height: 100px;
  line-height: 100px;
  border: 2px dashed #eee;
  text-align: center;
}

.upload-one {
  margin: 50px;

  .mt20 {
    margin-top: 20px;
  }
}
</style>