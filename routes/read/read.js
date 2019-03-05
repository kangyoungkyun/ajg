var express = require('express');
var router = express.Router();
var loger = require('../../logmodule.js');           //로그모듈
var client = require('../../config/mysqlconfig.js');        //mysql 모듈
loger.info("메모리 로딩 시작. - read.js");


/* 중분류 보기 */
router.get('/read/readmiddle', function (req, res, next) {

  res.render('read/readmiddle');

});



/* 포스트 보기 */
router.get('/read/readpost', function (req, res, next) {

  res.render('read/readpost');

});



module.exports = router;
loger.info("메모리 로딩 완료. - read.js");


