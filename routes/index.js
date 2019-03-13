var express = require('express');
var router = express.Router();
var loger = require('../logmodule.js');           //로그모듈
var client = require('../config/mysqlconfig.js');        //mysql 모듈
loger.info("메모리 로딩 시작. - index.js");


/* 메인화면 */
router.get('/', function (req, res, next) {

  var noticerowsResult;

      //공지글 조회
      
      var sql = 'select * from postTbl where bignum in (select bignum from bigTbl where title = ?) ORDER BY bignum DESC limit 0,3';
      client.query(sql, ['공지사항'], function (err4, noticerows, results) {
        if (err4) {
          loger.error('공지글 조회 문장에 오류가 있습니다. - /index/index - /index.js');
          loger.error(err4);
        } else {
          //공지글 존재
          if(noticerows.length > 0){

            noticerowsResult = noticerows;
          }else{
            //공지글이 없을때
            
            noticerowsResult = undefined;
          };
      };

      //최신글 (공지사항글 제외)
      var sql2 = 'select * from postTbl where bignum  not in (select bignum from bigTbl where title = ?) ORDER BY postnum DESC limit 0,3';
      client.query(sql2, ['공지사항'], function (err5, newrows, results) {
        if (err5) {
          loger.error('최신글 조회 문장에 오류가 있습니다. - /index/index - /index.js');
          loger.error(err5);
        } else {
          if(newrows.length > 0){
            //새글 존재

            res.render('index', {
              noticerows: noticerowsResult,
              newrows: newrows
            }); 
          }else{
            //새글 없음
            res.render('index', {
              noticerows: noticerowsResult,
              newrows: undefined
            });
          }
        }
      });


    });
});


/* 사역일정  */
router.get('/calandar', function (req, res, next) {
loger.info("사역일정");
res.render('main/calandar');
});
/* 주보  */
router.get('/joobo', function (req, res, next) {
  loger.info("주보");
  res.render('main/joobo');
  });

  /* 소개 */
router.get('/intro', function (req, res, next) {
  loger.info("소개");
  res.render('main/intro');
  });
  /* mail  */
router.get('/mail', function (req, res, next) {
  res.render('main/mail');
  });


module.exports = router;
loger.info("메모리 로딩 완료. - index.js");









  