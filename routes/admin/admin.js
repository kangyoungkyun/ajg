var express = require('express');
var router = express.Router();
var loger = require('../../logmodule.js');           //로그모듈
var client = require('../../config/mysqlconfig.js');        //mysql 모듈
loger.info("메모리 로딩 시작. - admin.js");



/* admin page. */
router.get('/admin/admin', function (req, res, next) {
  res.render('admin/admin');
});

module.exports = router;
loger.info("메모리 로딩 완료. - admin.js");


