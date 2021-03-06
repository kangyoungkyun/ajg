var express = require('express');
var router = express.Router();
var loger = require('../../logmodule.js');           //로그모듈
var client = require('../../config/mysqlconfig.js');        //mysql 모듈
loger.info("메모리 로딩 시작. - read.js");


/* 게시판 전체글 보기 */
router.get('/read/readbig', function (req, res, next) {
  var bignum = req.query.num;       //대분류 pk 값
  var album = req.query.album;       //대분류 pk 값
  
  // loger.info("앨범");
  // loger.info(album);

  var pagenum = req.query.pagenum;
  if (pagenum == undefined) {
    //현제 페이지
    var curPage = 1;
  } else {
    var curPage = pagenum;
  }

  //loger.info("curPage : " + curPage);

  //페이지당 게시물 수 : 한 페이지 당 10개 게시물
  var page_size = 10;
  //페이지의 갯수 : 1 ~ 10개 페이지
  var page_list_size = 5;
  //limit 변수
  var no = "";
  //전체 게시물의 숫자
  var totalPageCount = 0;

  //게시판 소개!
  var bigQueryString = 'select * from bigTbl where bignum = ?';
  client.query(bigQueryString, [bignum], function (error1, bigrows) {
    if (error1) {
      loger.info(error1 + "게시판 조회 조회 실패  - /read/readbig - /read.js");
      return
    }else{
  //글 조회 카운터!
  var queryString = 'select count(*) as cnt from postTbl where bignum = ? ORDER BY postnum DESC';
  client.query(queryString, [bignum], function (error2, data) {
    if (error2) {
      loger.info(error2 + "소분류 글 조회 조회 실패  - /read/readbig - /read.js");
      return
    }
    //전체 게시물의 숫자
    totalPageCount = data[0].cnt

    loger.info("현재 페이지 : " + curPage, "전체 게시물 수 : " + totalPageCount);

    //전체 페이지 갯수
    if (totalPageCount < 0) {
      totalPageCount = 0
    }

    var totalPage = Math.ceil(totalPageCount / page_size);            // 전체 페이지수    (전체 게시물 수 / 페지이 세로 사이즈 10)
    var totalSet = Math.ceil(totalPage / page_list_size);             // 전체 세트수     (전체 페이지 수 / 페이지 가로 사이즈 10)
    var curSet = Math.ceil(curPage / page_list_size)                  // 현재 셋트 번호   (클릭한 페이지 번호 / 페이지 가로 사이즈 10)
    var startPage = ((curSet - 1) * 5) + 1                           // 현재 세트내 출력될 시작 페이지
    var endPage = (startPage + page_list_size) - 1;                   // 현재 세트내 출력될 마지막 페이지
    
    //현재페이지가 0 보다 작으면
    if (curPage < 0) {
    no = 0
    } else {
    //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
    no = (curPage - 1) * 10
    }
    
    //loger.info('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage)
    
    var pasing = {
      "curPage": curPage,
      "page_list_size": page_list_size,
      "page_size": page_size,
      "totalPage": totalPage,
      "totalSet": totalSet,
      "curSet": curSet,
      "startPage": startPage,
      "endPage": endPage
      };

    //글 조회
    //
/* 
(select * from postTbl where  bignum = '1' and notice = 'true' ORDER BY postnum DESC limit 0,3)

union all

(select * from postTbl where  bignum = '1' and notice = 'false'  ORDER BY postnum DESC limit 0,10)
*/

    var sql = '(select * from postTbl where  bignum = ? and notice = "true" ORDER BY postnum DESC limit 0,3) ' + 
              'union all ' +
              '(select * from postTbl where  bignum = ? and notice = "false" ORDER BY postnum DESC limit ?,?)';
    client.query(sql, [bignum,bignum, no, page_size], function (err4, postrows, results) {
      if (err4) {
        loger.error('글 조회 문장에 오류가 있습니다. - /read/readbig - /read.js');
        loger.error(err4);
      } else {
        
        //loger.info("postrows ㄱㅐ수");
        //loger.info(postrows.length);

        if(postrows.length > 0){
          //게시판이 앨범게시판이 아닐경우
          if (album == 'false' || album == undefined || album == ''|| album == false) {
            res.render('read/readbig', {
              bigrows:bigrows,
              postrows: postrows,
              pasing: pasing
            });
          } else {
            res.render('read/readgallery', {
              bigrows:bigrows,
              postrows: postrows,
              pasing: pasing
            });
          }

        }else{
          //게시판이 앨범게시판이 아닐경우
          if (album == 'false' || album == undefined || album == ''|| album == false) {
            res.render('read/readbig', {
              bigrows:bigrows,
              postrows: undefined,
              pasing: pasing
            });
          } else {
            res.render('read/readgallery', {
              bigrows:bigrows,
              postrows: undefined,
              pasing: pasing
            });
          }
        }
      }
    });
  });
    }
  });
});

/* 포스트 보기 */
router.get('/read/readpost', function (req, res, next) {

  var postnum = req.query.postnum;       //대분류 pk 값
  loger.info("postnum");
  loger.info(postnum);

          //포스트 글 조회
          var sql = 'select * from postTbl where postnum = ?';
          client.query(sql, [postnum], function (err, postonerow, results) {
            if (err) {
              loger.error('내포스트 글 조회 문장에 오류가 있습니다. - /read/readpost - /read.js');
              loger.error(err);
            } else {
  
              //포스트 글 존재.
              if (postonerow.length > 0) {
                
                var newcnt = Number(postonerow[0]['cnt']) + 1;
  
                //조회수 조회해서 +1 한 후 업데이트!
                var cntupatesql = 'update postTbl set cnt= ' + newcnt + ' where postnum= ?';
                client.query(cntupatesql, [postnum], function (err5, postrows, results) {
                  if (err5) {
                    loger.error('내포스트 조회수 업데이트 문장에 오류가 있습니다. - /read/readpost - /read.js');
                    loger.error(err5);
                  } else {
  
                //조회수 업데이트 성공!
  
                //글 조회
                var sql4 =  'select * from userTbl u , postTbl p where u.usernum = p.usernum and p.postnum = ?';
  
                    client.query(sql4, [postnum], function (err4, postrows, results) {
                      if (err4) {
                        loger.error('내포스트 글 조회 문장에 오류가 있습니다. - /read/readpost - /read.js');
                        loger.error(err4);
                      } else {
   
                        //글 존재할때
                        if (postrows.length > 0) {
                          loger.info("포스트 글 존재!");
                          loger.info(postrows.length);
                          loger.info(postrows[0]['title']);
                          loger.info(postrows[0]['nickname']);
                          loger.info(postrows);

                          res.render('read/readpost', {
                            postrows: postrows
                          });
   
                          //글 존재 (x)   
                        } else {

                          loger.info("포스트 글 존재 안함!");
                          res.render('read/readpost', {
                            postrows: undefined
                          });

                        }
                      }
                    });
                  }
                });
              } else {
                res.render('read/readpost', {
                  postrows: undefined
                });
              }
            }
          });
});



module.exports = router;
loger.info("메모리 로딩 완료. - read.js");


