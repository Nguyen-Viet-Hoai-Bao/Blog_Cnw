package com.blog.dao;

import java.lang.reflect.AccessibleObject;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.blog.entity.Blog;

public class Db2 {
//	private  int age;
	public static void main(String[] args) {

		String sql = "select  * from t_blog";
		List<Blog> select = select1(sql, Blog.class);
		for (Blog map : select) {
			System.out.println(map);
		}
	}

	public static boolean insert(String sql) {
		int executeUpdate = 0;
		try {
			Connection conn = DbConnection.getConnection();
			Statement statement = conn.createStatement();
			executeUpdate = statement.executeUpdate(sql);
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return executeUpdate > 0;
	}

	public static List<Map<String, String>> select(String sql, String[] args) {
		List<Map<String, String>> list = new ArrayList<>();
		try {
			Connection conn = DbConnection.getConnection();
			Statement statement = conn.createStatement();
			ResultSet resultSet = statement.executeQuery(sql);
			while (resultSet.next()) {
				Map<String, String> map = new HashMap<>();
				for (String str : args) {
					map.put(str, resultSet.getString(str));
				}
				list.add(map);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return list;
	}

	public static <T> List<T> select(String sql, Class<T> cl) {
		List<T> list = new ArrayList<>();
		try {
			Connection conn = DbConnection.getConnection();
			Statement statement = conn.createStatement();
			ResultSet resultSet = statement.executeQuery(sql);
			while (resultSet.next()) {
				T t = cl.newInstance();
//				String [] strs= {};
				Field[] declaredFields = cl.getDeclaredFields();
				AccessibleObject.setAccessible(declaredFields, true);
				for (Field field : declaredFields) {
					field.set(t, resultSet.getObject(field.getName()));
				}
				list.add(t);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (InstantiationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return list;
	}
	public static <T> List<T> select1(String sql, Class<T> cl) {
		List<T> list = new ArrayList<>();
		try {
			Connection conn = DbConnection.getConnection();
			Statement statement = conn.createStatement();
			ResultSet resultSet = statement.executeQuery(sql);
			while (resultSet.next()) {
				T t = cl.newInstance();
//				String [] strs= {};
//				Field [] declaredFields = cl.getDeclaredFields();
//				AccessibleObject.setAccessible(declaredFields, true);
//				for (Field field : declaredFields) {
//					field.set(t, resultSet.getObject(field.getName()));
//				}
				Method[] declaredMethods = cl.getDeclaredMethods();
				for (Method method : declaredMethods) {
					String name = method.getName();
					if (name.startsWith("set")) {
						String str = name.substring(3);
						method.invoke(t, resultSet.getObject(lowerFirst(str)));
					}
				}
				list.add(t);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (InstantiationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IllegalArgumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return list;
	}

	private static String lowerFirst(String oldStr) {

		char[] chars = oldStr.toCharArray();

		chars[0] += 32;

		return String.valueOf(chars);

	}
	public static int getCount(String sql) {
		Connection connection = DbConnection.getConnection();
		int total = 0;
		try {
			Statement statement = connection.createStatement();
			ResultSet resultSet = statement.executeQuery(sql);
			if (resultSet.next()) {
				total = resultSet.getInt(1);
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return total;
	}
}
