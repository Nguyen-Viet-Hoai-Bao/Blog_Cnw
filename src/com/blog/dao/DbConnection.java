package com.blog.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbConnection {

//	public static final String DRIVER = "com.mysql.cj.jdbc.Driver"; 
//	public static final String URL = "jdbc:mysql://localhost:3306/trai_tre_mo_coi"; 
//	public static final String USER = "root"; 
//	public static final String PASSWORD = ""; 
	
	
	public static  Connection conn = null;
	public static Connection getConnection() {
		Connection c = null;
		
		try {
			// Đăng ký MySQL Driver với DriverManager
			DriverManager.registerDriver(new com.mysql.jdbc.Driver());
			
			// Các thông số
			String url = "jdbc:mySQL://localhost:3306/db_blog";
			String username = "root";
			String password = "";
			
			// Tạo kết nối
			c = DriverManager.getConnection(url, username, password);
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return c;
	}
//	public static Connection getConnection() {
//		
//		try {
//			if(conn!=null&&!conn.isClosed()) {
//				return conn;
//			}
//		} catch (SQLException e1) {
//			// TODO Auto-generated catch block
//			e1.printStackTrace();
//		}
//		try {
//			Class.forName(DRIVER);
//			 conn = DriverManager.getConnection(URL,USER,PASSWORD);
//			
//		} catch (ClassNotFoundException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		} catch (SQLException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
//		return conn;
//	}
}
