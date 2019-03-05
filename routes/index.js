var express = require('express');
var router = express.Router();
var loger = require('../logmodule.js');           //로그모듈

loger.info("메모리 로딩 시작. - index.js");


/* 메인화면 */
router.get('/', function (req, res, next) {
  res.render('index');
});

module.exports = router;
loger.info("메모리 로딩 완료. - index.js");









  