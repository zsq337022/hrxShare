'use strict';

const fse = require('fs-extra')
const path = require('path')

const BaseController = require('./base')

class HomeController extends BaseController {
  async index() {
    const { ctx } = this;
    this.success('hi, egg');
  }
  async uploadFile() {
    const { ctx } = this;
    console.log('uploadFile');
    const file = ctx.request.files[0];
    const { name } = ctx.request.body
    await fse.move(file.filepath, this.config.UPLOAD_DIR + '/' + file.filename)
    this.success({ url: `/public/${file.filename}` });
  }
  async uploadFileChunks() {
    const { ctx } = this
    const file = ctx.request.files[0]
    const { hash, name } = ctx.request.body
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }
    if (!fse.existsSync(path.resolve(this.config.UPLOAD_DIR, `${chunkPath}/${name}`))) {
      await fse.move(file.filepath, `${chunkPath}/${name}`)
    }
    this.message('切片上传成功')
  }
  async mergeFile() {
    const { ext, size, hash } = this.ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await this.ctx.service.tools.mergeFile(filePath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`,
    })
  }
  async mergeChunks(files, dest, size) {
    const pipStream = (filePath, writeStream) => new Promise(resolve => {
      //可读取的流对象
      const readStream = fse.createReadStream(filePath)
      readStream.on('end', () => {
        fse.unlinkSync(filePath)
        resolve()
      })
      // 把可读取的流对象的数据通过管到链接到可写入流对象进行文件写入合并操作
      readStream.pipe(writeStream)
    })
    await Promise.all(
      files.forEach((file, index) => {
        // 可写入的流对象
        console.log(file, index);
        pipStream(file, fse.createWriteStream(dest, {
          start: index * size,
          end: (index + 1) * size,
        }))
      })
    )
  }
}

module.exports = HomeController;
