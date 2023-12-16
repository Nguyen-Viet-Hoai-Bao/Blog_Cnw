<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Đăng blog</title>
<link rel="stylesheet" href="<%=request.getContextPath() %>/css/publish.css">
</head>
<body>
<div class="whole">
        <div class="top_bg">
            <div class="content">
                <div class="title">
                    <span>Viết một blog</span>
                </div>
                <div class="main">
                    <div class="blog_box">
                        <div class="blog_title">
                           	<form action="<%=request.getContextPath() %>/BlogInsert" method="post">
							<input type="hidden" value="" name="id" id="id"/>
								Tiêu đề Blog：<input type="text" value="" name="title" id="title"/><br/>
								Người viết blog：<input type="text" value="" name="author" id="author"/><br/>
								Giới thiệu blog：<input type="text" value="" name="description" id="description"/><br/>
								<div id="div1" >
						        	<p></p>
						    	</div>
						    	<textarea id="text1" style="display:none;" name="content"></textarea>
								<input type="submit">
							</form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
<script type="text/javascript" src="<%=request.getContextPath() %>/js/jquery.min.js"></script>
<script type="text/javascript" src="<%=request.getContextPath() %>/js/wangEditor.js"></script>

<script type="text/javascript">
      var E = window.wangEditor;
      var editor = new E('#div1');
      var $text1 = $('#text1');
      editor.customConfig.onchange = function (html) {
          $text1.val(html);
      }
      editor.create()
      $text1.val(editor.txt.html())
  </script>
<script type="text/javascript">
var flag = ${flag};
if(flag!=""){
	if(flag){
		alert("Đăng thành công！");
		window.location.href="<%=request.getContextPath()%>/BlogListServlet";
	}else{
		alert("Đăng không thành công！");
	}
}
</script>
</html>
