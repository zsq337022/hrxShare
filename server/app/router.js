'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/test', controller.home.index);
  router.post('/uploadFile', controller.home.uploadFile);
  router.post('/uploadFileChunks',controller.home.uploadFileChunks)
  router.post('/mergefile', controller.home.mergeFile);
};
