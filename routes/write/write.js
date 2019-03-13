var express = require('express');
var router = express.Router();
var loger = require('../../logmodule.js');                  //로그모듈
var multer = require('multer')                          //파일관련 모듈
var client = require('../../config/mysqlconfig.js');        //mysql 모듈
var fs = require('fs'); 
loger.info("메모리 로딩 시작. - write.js");

/* 대분류 - 게시판 생성 페이지 */
router.get('/write/bigwrite', function (req, res, next) {
  res.render('write/bigwrite');
});



/* 글쓰기 페이지 */
router.get('/write/write', function (req, res, next) {

  // 글쓰기에서 게시판 셀렉트 박스 선택 위한 조회 쿼리
  var sql = 'select * from bigTbl';
  client.query(sql, function (err, selectrows, results) {
    if (err) {
      loger.error(err);
      return;
    } else {
      res.render('write/write', {
        selectrows: selectrows
      });
    }
  }); 

});

// //파일 저장위치와 파일이름 설정
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     //파일이 이미지 파일이면
//     if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
//       cb(null, 'public/bigwriteimages');
//       //텍스트 파일이면 
//     } else {
//       loger.info("그림파일만 등록할 수 있습니다.");
//     };
//   },
//   //파일이름 설정
//   filename: function (req, file, cb) {
//     var nowdate = new Date().toLocaleString();
//     var nowdate2 = nowdate.replace(' ','');
//     var nowdate3 = nowdate2.replace(':','');
//     var nowdate4 = nowdate3.replace('-','');
//     var nowdate5 = nowdate4.replace('-','');
//     var now = nowdate5.replace(':','');
//     var filename = now + '.png';
//     cb(null,filename);                          // cb 콜백함수를 통해 전송된 파일 이름 설정
//   }
// });

// //파일 업로드 모듈
// var upload = multer({ storage: storage });
// /* 대분류 저장 액션 */
// router.post('/write/bigwritesaveimage', upload.single('fileupload') ,function (req, res, next) {
//   loger.info('대분류 이미지 저장 진입  - /write/bigwritesaveimage - write.js ');
//   //파일 경로 넘겨주기
//   //var originalFileName = req.file.originalname;
//   var nowdate = new Date().toLocaleString();
//   var nowdate2 = nowdate.replace(' ','');
//   var nowdate3 = nowdate2.replace(':','');
//   var nowdate4 = nowdate3.replace('-','');
//   var nowdate5 = nowdate4.replace('-','');
//   var now = nowdate5.replace(':','');

//   res.send({ result: 'success' , 'path' : 'public/bigwriteimages/'+ now + '.png' });
// });


/* 게시판 생성 저장 액션 */
router.post('/write/bigwritesave',function (req, res, next) {
  loger.info('게시판 제목 저장 진입  - /write/bigwritesave - write.js');

  var title = req.body.title;
  var close = req.body.close;
  var summernoteContent = req.body.summernoteContent;
  var album = req.body.album;
  

  var insertsql = 'insert into bigTbl (title,description,close,album) values (?,?,?,?)';
  var params = [title, summernoteContent, close,album];
  client.query(insertsql, params, function (err, rows, fields) {
    if (err) {
      loger.error('대분류 insert 쿼리에 오류가 있습니다. - /write/bigwritesave - write.js');
      loger.error(err);
    } else {
      if(rows.insertId){
        res.send({ result: 'success' , tocken:'저장성공'});
      }else{
        res.send({ result: 'fail' , tocken:'저장실패'});
      }
    }
  });

});


//나의 포스터 저장 액션!
router.post('/write/writepostsave', function (req, res, next) {
  loger.info('나의 포스터 저장 진입  - /write/writepostsave - write.js');

  var posttitle = req.body.posttitle;                                                          
  var notice = req.body.notice;                                                  
  var bignum = req.body.bignum;         
  var summernoteContent = req.body.summernoteContent;      
  var author = req.session.nickname;                    //로그인한 유저 세션 체크 + 이름가져오기
  var authId = req.session.authId;
  

  if(author == null || author == undefined || authId == null || authId == undefined){
    res.send({ result: 'fail' , tocken:'로그인해주세요'});
    return;
  }else{

    loger.info(posttitle);  
    loger.info(notice);      //false
    loger.info(bignum);  //1
    loger.info(summernoteContent);
  
    //유저 키 조회
    client.query('SELECT ?? FROM ?? WHERE ?? = ?',
      ['usernum', 'userTbl', 'id', authId], function (err, rows, results) {

        if (err) {
          loger.error('userkey 조회 쿼리 문장에 오류가 있습니다. - write.js - /write/writepostsave');
          loger.error(err);
        } else {

          var usernum = rows[0]['usernum'];

          var insertsql = 'insert into postTbl (bignum,usernum, title,description,notice,author,cnt) values (?,?,?,?,?,?,?)';
          var params = [bignum,usernum,posttitle,summernoteContent,notice,author,'0'];
          client.query(insertsql, params, function (err, rows, fields) {
            if (err) {
              loger.error('post insert 쿼리에 오류가 있습니다. - /write/writepostsave - write.js');
              loger.error(err);
            } else {
              if(rows.insertId){
                res.send({ result: 'success' , tocken:'저장성공'});
              }else{
                res.send({ result: 'fail' , tocken:'저장실패'});
              }
            }
          });
        }
      });
  }
});


var uploadImages = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {

      //파일이 이미지 파일이면
      if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
        cb(null, 'public/mypostimages/');
        //텍스트 파일이면 
      } else {
        loger.info("그림파일만 등록할 수 있습니다.");
      };
    },
    filename: function (req, file, cb) {
      var nowdate = new Date().toLocaleString();
      var nowdate2 = nowdate.replace(' ','');
      var nowdate3 = nowdate2.replace(':','');
      var nowdate4 = nowdate3.replace('-','');
      var nowdate5 = nowdate4.replace('-','');
      var now = nowdate5.replace(':','');
      var filename = now + '.png';
      cb(null,filename);                          // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
  }),
});

//사진 파일 선택하면 바로 콜 - 사진 저장 진입
router.post('/write/writepostimagesave', uploadImages.single('file'), function (req, res, next) {
  loger.info('나의 포스터 사진 저장 진입  - /write/writepostimagesave - write.js');
  res.send({ url: "/mypostimages/" + req.file['filename']});
});


//나의 포스터 이미지 삭제 액션!
router.post('/write/writepostimagedelete', function (req, res, next) {
  loger.info('나의 포스터 이미지 삭제 진입  - /write/writepostimagedelete - write.js');

  var beforeSrc = req.body.src;
  var afterSrc = beforeSrc.split('/');
  var filename = afterSrc.slice(-1)[0];     //제일 마지막 배열 요소 가져오기
                   
  
  loger.info('삭제할 파일 이름 : ' + filename);

  fs.unlink('./public/mypostimages/'+ filename,function (err) {
    if (err) throw err;
    console.log('successfully deleted ./public/mypostimages/'+filename);
  });

});


//게시판 수정
router.get('/write/middlemodiy', function (req, res, next) {

  var bignum = req.query.num;       //중분류 pk 값
  loger.info(bignum);

  var sql2 = 'select * from bigTbl where bignum = ?';
  client.query(sql2, [bignum], function (err2, onerow, results) {
    if (err2) {
      loger.error('대분류 글 하나 조회 문장에 오류가 있습니다. - /write/middlemodiy - /write.js');
      loger.error(err2);
    } else {
      //수정할 대분류 글과 왼쪽 사이드 메뉴명 넘기기
      res.render('write/bigmodiy', {
        onerow: onerow
      });
    }
  });
});

/*게시판 수정 액션 */
router.post('/write/middlemodiy',function (req, res, next) {
  loger.info('게시판 수정 진입  - /write/middlemodiy - write.js');

  var bignum = req.body.bignum;
  var title = req.body.title;
  var close = req.body.close;
  var album = req.body.album;
  var summernoteContent = req.body.summernoteContent;

  var updatesql = 'update bigTbl set title = ? , description = ? , close = ?, album=? where bignum = ? ';
  var params = [title, summernoteContent, close,album, bignum];
  client.query(updatesql, params, function (err, rows, fields) {
    if (err) {
      loger.error('게시판 update 쿼리에 오류가 있습니다. - /write/middlemodiy - write.js');
      loger.error(err);
      res.send({ result: 'fail' , tocken:'수정실패'});
    } else {
      res.send({ result: 'success' , tocken:'수정성공'});
    }
  });
});
module.exports = router;
loger.info("메모리 로딩 완료. - write.js");


