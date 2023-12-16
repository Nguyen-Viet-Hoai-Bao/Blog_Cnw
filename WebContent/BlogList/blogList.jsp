<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Blog-List</title>
    <link rel="stylesheet" href="<%=request.getContextPath() %>/css/List.css">
     <script type="text/javascript" src="<%=request.getContextPath()%>/js/jquery-3.4.1.min.js"></script>
    <script src="<%=request.getContextPath() %>/js/List.js"></script>
</head>
<body>
<div class="whole">
    <div class="top_bg">
        <div class="content">
            <div class="title">
                <span>Blog</span>
                <div class="nav">
                    <ul>
                        <li><a href="#">Trang đầu</a></li>
                        <li class="listStyle"><a href="#">Blog của tôi</a></li>
                        <li><a href="#">Chủ đề</a></li>
                        <li><a href="#">Sưu tầm</a></li>
                        <li><a href="#">Thông tin cá nhân</a></li>
                    </ul>
                    <div class="write">
                    	<img src="<%=request.getContextPath()%>/images/Blog/pen.png"/>
                    	<button onclick="createBlog()">Tạo blog mới</button>
                    </div>
                </div>
            </div>
            <div class="main">
                <c:forEach var="blog" items="${blogs }">
                <div class="blog_box" >
                    <div class="blog_title">
                        <span class="title_style">${blog.title }</span>
                        <span>Java</span>
                        <span class="time">${blog.date }</span>
                        <span >By - ${blog.author }</span>
                        <div class="btn">
                            <span class="updateSubmit" update="${blog.id }">Cập nhật Blog</span>
                            <span onclick="deleteBlog(${blog.id})">Xóa Blog</span>
                        </div>
                    </div>
                    <div class="blog_content">
                            <span>${blog.description }</span>
                        <img src="" alt="">
                    </div>
                </div>
                    <hr>
                <div class="blog_box">
                    <div class="blog_title">
                        <span class="title_style">${blog.title }</span>
                        <span>Java</span>
                        <span class="time">2019-8-22</span>
                        <div class="btn">
                            <span>Cập nhật</span>
                            <span>Xóa</span>
                        </div>
                    </div>
                    <div class="blog_content">
                            <span>${blog.description }</span>
                        <img src="<%=request.getContextPath() %>/images/Blog/blog.png" alt="">
                    </div>
                </div>
                    <hr>
                </c:forEach>
            </div>
            <div>
            	<h1>
            		${blog.title }
            	</h1><br>
            	<h2>
            		${blog.content }
				</h2>
            </div>
        </div>
    </div>
</div>
</body>
<script type="text/javascript">
    $(".updateSubmit").on("click",function(){
        var bid = $(this).attr("update");
        window.location.href="<%=request.getContextPath()%>/BlogUpdate?bid=" + bid;
    });

    var deleteBlog = function(id){
        if(confirm("Bạn có chắc chắn muốn xóa blog này？")){
            window.location.href="<%=request.getContextPath()%>/BlogDelete?bid=" + id;
        }
    }


    var createBlog = function(){
        window.location.href="<%=request.getContextPath()%>/BlogList/blogPublish.jsp";
    }
</script>
</html>