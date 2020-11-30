'use strict';

const fse = require('fs-extra')
const path = require('path')

const BaseController = require('./base')

class HomeController extends BaseController {
  async index() {
    const { ctx } = this;
    this.success('hi, egg');
  }
  async uploadFile(){
    const { ctx } = this;
    const file = ctx.request.files[0];
    const {name} = ctx.request.body
    await fse.move(file.filepath, this.config.UPLOAD_DIR+'/'+file.filename)
    this.success({url:`/public/${file.filename}`});
  }
}

module.exports = HomeController;
