<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>update</title>
<link rel="stylesheet" href="<%=request.getContextPath() %>/css/publish.css">
</head>
<body>
<div class="whole">
        <div class="top_bg">
            <div class="content">
                <div class="title">
                    <span>Update Blog</span>
                </div>
                <div class="main">
                    <div class="blog_box">
                        <div class="blog_title">
                           	<form action="<%=request.getContextPath() %>/BlogUpdate" method="post">
							<input type="hidden" value="${blogs.id}" name="id" id="id"/>
								Tiêu đề Blog：<input type="text" value="${blogs.title}" name="title" id="title"/><br/>
								Người viết Blog：<input type="text" value="${blogs.author}" name="author" id="author"/><br/>
								<div id="div1" >
						        	<p>${blogs.content}</p>
						    	</div>
						    	<textarea id="text1" style="display:none;" name="content"></textarea>
								<input type="submit">
							</form>
							<button onclick="reSet()">Reset</button>
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
var title = $("#title");
var author = $("#author");
var content = $("#content");

var reSet = function(){
	title.val(  "${blogs.title}");
	author.val("${blogs.author}");
	content.val("${blogs.content}") ;
}

var code = ${code};
if(code!=""){
	if(code==200){
		alert("Update success！");
		window.location.href="<%=request.getContextPath()%>/BlogListServlet";
	}else{
		alert("Cannot be Update！");
	}
}
</script>
</html>
